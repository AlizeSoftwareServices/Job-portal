import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendApplicationConfirmation(email: string, firstName: string, jobTitle: string, referenceNumber: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
      console.log(`[MOCK EMAIL] To: ${email} | Subject: Application Received for ${jobTitle} (Ref: ${referenceNumber})`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"SkyoConsultancy" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Application Received: ${jobTitle} at SkyoConsultancy`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <p>Hi <strong>${firstName}</strong>,</p>
            <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at SkyoConsultancy. We have successfully received your application.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #4b5563;">Your Application Reference ID is:</p>
              <h3 style="margin: 5px 0 0 0; color: #1e3a8a; letter-spacing: 2px;">${referenceNumber}</h3>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">(Please save this Reference ID to track your application status on our portal.)</p>
            </div>
            <p>Our team will carefully review your profile and get back to you if it matches our current requirements. We appreciate your interest in joining SkyoConsultancy!</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>SkyoConsultancy Team</strong></p>
          </div>
        `
      });
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }

  async sendCustomEmail(email: string, subject: string, message: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
      console.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}\nMessage: ${message}`);
      return;
    }

    try {
      const htmlMessage = message.replace(/\n/g, '<br/>');
      await this.transporter.sendMail({
        from: `"SkyoConsultancy" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
            ${htmlMessage}
          </div>
        `,
      });
      console.log(`Custom email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send custom email to ${email}:`, error);
    }
  }

  async sendRegistrationOtpEmail(email: string, code: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
      console.log(`[MOCK EMAIL] OTP: ${code} to ${email}`);
      return;
    }
    try {
      await this.transporter.sendMail({
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
  }

  async sendForgotPasswordOtpEmail(email: string, code: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
      console.log(`[MOCK EMAIL] OTP: ${code} to ${email}`);
      return;
    }
    try {
      await this.transporter.sendMail({
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
  }

  async sendStatusUpdateEmail(email: string, firstName: string, jobTitle: string, status: string, referenceNumber: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') {
      console.log(`[MOCK EMAIL] To: ${email} | Subject: Application Status Update (${referenceNumber})`);
      return;
    }

    let subject = `Application Status Update: ${jobTitle}`;
    let htmlContent = '';

    if (status === 'SELECTED') {
      subject = `Congratulations! You have been selected for the ${jobTitle} position at SkyoConsultancy`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>We are absolutely thrilled to inform you that you have been selected for the <strong>${jobTitle}</strong> position at SkyoConsultancy!</p>
          <p>Your skills and experience stood out to us, and we are incredibly excited to have you join our team and contribute to our shared goals.</p>
          <p>Our HR team will reach out to you shortly with your formal offer and further onboarding details. Please let us know if you have any immediate questions in the meantime.</p>
          <p>Welcome to the SkyoConsultancy family! We look forward to achieving great things together.</p>
          <br/>
          <p>Warm regards,</p>
          <p><strong>SkyoConsultancy Team</strong></p>
        </div>
      `;
    } else if (status === 'REJECTED') {
      subject = `Update on your application for ${jobTitle} at SkyoConsultancy`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Thank you for your application for the role of <strong>${jobTitle}</strong> at SkyoConsultancy. First off, we want to sincerely thank you for the time and effort you've invested in our recruitment process.</p>
          <p>While your profile is quite impressive, we will not be moving forward with your application as we feel it is not an exact match for our requirements at this point in time. Should a suitable position open up where your professional background is a better fit for our needs, we would like to reach out to you in the future.</p>
          <p>We are sure that given your profile, you will have amazing success in finding a role that fits you best. We wish you good luck with your job search and all your future professional endeavors.</p>
          <p>To view additional job opportunities with SkyoConsultancy, please visit our careers site by clicking the following link: <a href="http://localhost:3001/jobs">SkyoConsultancy Careers</a></p>
          <br/>
          <p>Regards,</p>
          <p><strong>SkyoConsultancy Team</strong></p>
        </div>
      `;
    } else {
      const readableStatus = status.replace(/_/g, ' ');
      htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1e3a8a;">Status Update for Your Application</h2>
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>There has been an update regarding your application for the <strong>${jobTitle}</strong> position.</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 0; color: #4b5563; font-size: 14px;">Current Status:</p>
            <h3 style="margin: 5px 0 0 0; color: #16a34a; text-transform: capitalize;">${readableStatus}</h3>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Reference No: ${referenceNumber}</p>
          </div>
          <p>You can track the full timeline of your application by entering your reference number on our portal's tracking page.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>SkyoConsultancy Team</strong></p>
        </div>
      `;
    }

    try {
      await this.transporter.sendMail({
        from: `"SkyoConsultancy" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent
      });
      console.log(`Status update email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send status email to ${email}:`, error);
    }
  }

  async sendAdminNewApplicationEmail(adminEmail: string, candidateDetails: any, jobTitle: string, referenceNumber: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') return;

    try {
      await this.transporter.sendMail({
        from: `"Skyo System" <${process.env.GMAIL_USER}>`,
        to: adminEmail,
        subject: `New Application Received: ${jobTitle} (${referenceNumber})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
            <div style="background-color: #1e3a8a; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="color: white; margin: 0;">New Job Application</h2>
            </div>
            <div style="padding: 20px;">
              <p>A new candidate has just applied for the <strong>${jobTitle}</strong> position.</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Applicant Details</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${candidateDetails.firstName} ${candidateDetails.lastName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${candidateDetails.email}" style="color: #0284c7;">${candidateDetails.email}</a></p>
                <p style="margin: 8px 0;"><strong>Phone:</strong> ${candidateDetails.phone || 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Location:</strong> ${[candidateDetails.city, candidateDetails.state].filter(Boolean).join(', ') || 'N/A'}</p>
                <p style="margin: 8px 0;"><strong>Reference No:</strong> <span style="color: #0284c7; font-weight: bold;">${referenceNumber}</span></p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3001/empadmin" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Dashboard</a>
              </div>
            </div>
            <div style="text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <p>This is an automated notification from the SkyoConsultancy Platform.</p>
            </div>
          </div>
        `
      });
      console.log(`Admin notification email sent for application ${referenceNumber}`);
    } catch (error) {
      console.error(`Failed to send admin notification email:`, error);
    }
  }
  async sendAdminNewEmployerEmail(adminEmail: string, companyName: string, hrName: string, email: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') return;

    try {
      await this.transporter.sendMail({
        from: `"Skyo System" <${process.env.GMAIL_USER}>`,
        to: adminEmail,
        subject: `New Employer Account Created: ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
            <div style="background-color: #1e3a8a; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="color: white; margin: 0;">New Employer Registration</h2>
            </div>
            <div style="padding: 20px;">
              <p>A new employer account has been created on the platform.</p>
              
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Employer Details</h3>
                <p style="margin: 8px 0;"><strong>Company Name:</strong> ${companyName}</p>
                <p style="margin: 8px 0;"><strong>HR Name:</strong> ${hrName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0284c7;">${email}</a></p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3001/admin" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Dashboard</a>
              </div>
            </div>
            <div style="text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <p>This is an automated notification from the SkyoConsultancy Platform.</p>
            </div>
          </div>
        `
      });
      console.log(`Admin notification email sent for new employer ${companyName}`);
    } catch (error) {
      console.error(`Failed to send admin notification email:`, error);
    }
  }

  async sendAdminNewJobRequestEmail(adminEmail: string, jobTitle: string, companyName: string) {
    if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your-email@gmail.com') return;

    try {
      await this.transporter.sendMail({
        from: `"Skyo System" <${process.env.GMAIL_USER}>`,
        to: adminEmail,
        subject: `New Job Post Request: ${jobTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
            <div style="background-color: #f59e0b; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
              <h2 style="color: white; margin: 0;">New Job Post Request</h2>
            </div>
            <div style="padding: 20px;">
              <p>An employer has requested to post a new job. It is currently pending approval.</p>
              
              <div style="background-color: #fffbeb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #fde68a;">
                <h3 style="margin-top: 0; color: #92400e; border-bottom: 1px solid #fcd34d; padding-bottom: 8px;">Job Request Details</h3>
                <p style="margin: 8px 0; color: #92400e;"><strong>Job Title:</strong> ${jobTitle}</p>
                <p style="margin: 8px 0; color: #92400e;"><strong>Company Name:</strong> ${companyName || 'Not specified'}</p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3001/admin" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Review in Dashboard</a>
              </div>
            </div>
            <div style="text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              <p>This is an automated notification from the SkyoConsultancy Platform.</p>
            </div>
          </div>
        `
      });
      console.log(`Admin notification email sent for new job request ${jobTitle}`);
    } catch (error) {
      console.error(`Failed to send admin notification email:`, error);
    }
  }
}
