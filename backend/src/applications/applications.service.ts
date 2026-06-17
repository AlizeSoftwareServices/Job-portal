import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  private generateReferenceNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `NEXUS-${result}`;
  }

  async createApplication(data: any) {
    if (!data.recaptchaToken) {
      throw new BadRequestException('reCAPTCHA token is required');
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    
    try {
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${secretKey}&response=${data.recaptchaToken}`,
      });
      const recaptchaData = await response.json();
      
      if (!recaptchaData.success) {
        throw new BadRequestException('reCAPTCHA verification failed');
      }
    } catch (error) {
      throw new BadRequestException('Error verifying reCAPTCHA');
    }

    const job = data.jobId ? await this.prisma.job.findUnique({ where: { id: data.jobId } }) : null;

    const application = await this.prisma.application.create({
      data: {
        candidateId: data.candidateId || null,
        jobId: data.jobId || null,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        noticePeriod: data.noticePeriod,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        resumeUrl: data.resumeUrl,
        referenceNumber: this.generateReferenceNumber(),
      },
    });

    if (data.email) {
      const jobTitle = job ? job.title : 'General Registration';
      await this.mailService.sendApplicationConfirmation(data.email, data.firstName || 'Candidate', jobTitle, application.referenceNumber || 'UNKNOWN');
      
      // Send admin notification
      if (process.env.GMAIL_USER && process.env.GMAIL_USER !== 'your-email@gmail.com') {
        await this.mailService.sendAdminNewApplicationEmail(
          process.env.GMAIL_USER,
          data,
          jobTitle,
          application.referenceNumber || 'UNKNOWN'
        );
      }
    }

    return application;
  }

  async getAllApplications() {
    return this.prisma.application.findMany({
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          include: { category: true }
        },
        candidate: {
          select: {
            id: true,
            email: true,
            candidateProfile: true,
          }
        }
      }
    });
  }

  async getApplicationsByJob(jobId: string) {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            email: true,
            candidateProfile: true,
          }
        }
      }
    });
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus) {
    const application = await this.prisma.application.update({
      where: { id },
      data: { status },
      include: { job: true, candidate: true }
    });

    const recipientEmail = application.email || application.candidate?.email;
    const recipientName = application.firstName || application.candidate?.email || 'Candidate';
    const jobTitle = application.job ? application.job.title : 'General Registration';

    if (recipientEmail) {
      await this.mailService.sendStatusUpdateEmail(
        recipientEmail,
        recipientName,
        jobTitle,
        status,
        application.referenceNumber || 'UNKNOWN'
      );
    }

    return application;
  }

  async sendCustomEmail(id: string, subject: string, message: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { job: true, candidate: true }
    });

    if (!application) throw new Error('Application not found');

    const recipientEmail = application.email || application.candidate?.email;

    if (!recipientEmail) throw new Error('No email found for this application');

    const jobTitle = application.job ? application.job.title : 'General Registration';
    const finalSubject = subject || `Update regarding your application for ${jobTitle}`;

    await this.mailService.sendCustomEmail(
      recipientEmail,
      finalSubject,
      message
    );

    return { success: true };
  }

  async markAsReviewed(id: string) {
    const application = await this.prisma.application.update({
      where: { id },
      data: { isReviewed: true },
    });
    return application;
  }

  async getTrackApplication(referenceNumber: string) {
    const application = await this.prisma.application.findUnique({
      where: { referenceNumber },
      include: {
        job: {
          select: { title: true, jobCode: true }
        }
      }
    });

    if (!application) {
      throw new BadRequestException('Invalid reference number');
    }

    return application;
  }
}
