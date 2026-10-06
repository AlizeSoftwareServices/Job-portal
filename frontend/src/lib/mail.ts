import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  return 'https://skyoconsultancy.vercel.app';
};

export const MailService = {

  async sendApplicationConfirmation(email: string, firstName: string, jobTitle: string, referenceNumber: string) {
    // Automated notification email disabled - only OTP emails active
    return;
  },

  async sendCustomEmail(email: string, subject: string, message: string) {
    // Automated notification email disabled - only OTP emails active
    return;
  },

  async sendRegistrationOtpEmail(email: string, code: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
      console.log(`[MOCK EMAIL] OTP: ${code} to ${email}`);
      return;
    }
    try {
      await transporter.sendMail({
        from: `"SkyoConsultancy Security" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'SkyoConsultancy - Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1e3a8a;">Welcome to SkyoConsultancy!</h2>
            </div>
            <p>Hello,</p>
            <p>Thank you for signing up. To complete your registration and verify your email address, please use the One-Time Password (OTP) below:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <h1 style="margin: 0; color: #4338ca; letter-spacing: 5px; font-size: 32px;">${code}</h1>
            </div>
            <p style="color: #b91c1c; font-size: 14px;"><strong>Note:</strong> This verification code is valid for only <strong>3 minutes</strong>. Please do not share this code with anyone.</p>
            <p>If you did not request this code, you can safely ignore this email.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>SkyoConsultancy Security Team</strong></p>
          </div>
        `
      });
    } catch (e) { console.error(e); }
  },

  async sendForgotPasswordOtpEmail(email: string, code: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
      console.log(`[MOCK EMAIL] OTP: ${code} to ${email}`);
      return;
    }
    try {
      await transporter.sendMail({
        from: `"SkyoConsultancy Security" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'SkyoConsultancy - Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1e3a8a;">Password Reset</h2>
            </div>
            <p>Hello,</p>
            <p>We received a request to reset the password for your SkyoConsultancy account. Please use the following One-Time Password (OTP) to securely reset your password:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <h1 style="margin: 0; color: #4338ca; letter-spacing: 5px; font-size: 32px;">${code}</h1>
            </div>
            <p style="color: #b91c1c; font-size: 14px;"><strong>Note:</strong> This OTP is valid for only <strong>3 minutes</strong>. For your security, please do not share this code.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>SkyoConsultancy Security Team</strong></p>
          </div>
        `
      });
    } catch (e) { console.error(e); }
  },

  async sendStatusUpdateEmail(email: string, firstName: string, jobTitle: string, status: string, referenceNumber: string) {
    // Automated notification email disabled - only OTP emails active
    return;
  },

  async sendAdminNewApplicationEmail(adminEmail: string, candidateDetails: any, jobTitle: string, referenceNumber: string) {
    // Automated notification email disabled - only OTP emails active
    return;
  },

  async sendAdminNewEmployerEmail(adminEmail: string, companyName: string, hrName: string, email: string) {
    // Automated notification email disabled - only OTP emails active
    return;
  },

  async sendAdminNewJobRequestEmail(adminEmail: string, jobTitle: string, companyName: string) {
    // Automated notification email disabled - only OTP emails active
    return;
  }
};
