export const WhatsappService = {
  async sendTemplateMessage(templateName: string, recipientNumber: string, variables: string[]) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || 'v20.0';
    const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US';

    if (!accessToken || !phoneNumberId || !recipientNumber || !templateName) {
      console.log(`[MOCK WHATSAPP] Template: ${templateName} | To: ${recipientNumber} | Vars: ${variables.join(', ')}`);
      return;
    }

    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

    const parameters = variables.map((text) => ({
      type: 'text',
      text: String(text).substring(0, 1024) // Ensure we don't exceed WhatsApp limits
    }));

    const payload = {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        },
        components: [
          {
            type: 'body',
            parameters: parameters
          }
        ]
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error(`WhatsApp API Error [${response.status}]:`, responseData);
      } else {
        console.log(`WhatsApp template '${templateName}' sent to ${recipientNumber} successfully.`);
      }
    } catch (error) {
      console.error(`Failed to send WhatsApp message to ${recipientNumber}:`, error);
    }
  },

  async sendApplicationNotification(data: {
    candidateName: string;
    phone: string;
    jobTitle: string;
    jobCode: string;
    referenceNumber: string;
    appliedTime: string;
  }) {
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
    const templateName = process.env.WHATSAPP_TEMPLATE_APPLICATION;

    if (!adminNumber || !templateName) {
      console.log('[MOCK WHATSAPP] Missing ADMIN_WHATSAPP_NUMBER or WHATSAPP_TEMPLATE_APPLICATION env vars.');
      return;
    }

    const variables = [
      data.candidateName || 'Unknown',
      data.phone || 'N/A',
      data.jobTitle || 'N/A',
      data.jobCode || 'N/A',
      data.referenceNumber || 'N/A',
      data.appliedTime || new Date().toLocaleString()
    ];

    await this.sendTemplateMessage(templateName, adminNumber, variables);
  },

  async sendJobRequestNotification(data: {
    companyName: string;
    hrName: string;
    phone: string;
    jobTitle: string;
    jobCode: string;
    location: string;
    vacancyCount: string | number;
    requestTime: string;
  }) {
    const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
    const templateName = process.env.WHATSAPP_TEMPLATE_JOB_REQUEST;

    if (!adminNumber || !templateName) {
      console.log('[MOCK WHATSAPP] Missing ADMIN_WHATSAPP_NUMBER or WHATSAPP_TEMPLATE_JOB_REQUEST env vars.');
      return;
    }

    const variables = [
      data.companyName || 'Not specified',
      data.hrName || 'Not specified',
      data.phone || 'N/A',
      data.jobTitle || 'N/A',
      data.jobCode || 'N/A',
      data.location || 'N/A',
      String(data.vacancyCount || 1),
      data.requestTime || new Date().toLocaleString()
    ];

    await this.sendTemplateMessage(templateName, adminNumber, variables);
  }
};
