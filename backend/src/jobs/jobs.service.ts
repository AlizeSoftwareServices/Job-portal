import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { MailService } from '../mail/mail.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  private generateRoleCode(title: string): string {
    const cleanTitle = title.replace(/[^a-zA-Z ]/g, '').toUpperCase();
    const words = cleanTitle.split(/\s+/).filter(w => w.length > 0);
    let code = 'JOB';
    if (words.length === 1 && words[0].length >= 3) {
      code = words[0].substring(0, 3);
    } else if (words.length === 2) {
      const firstWord = words[0];
      const secondWord = words[1];
      const consonants = firstWord.substring(1).replace(/[AEIOU]/g, '');
      const middleChar = consonants.length > 0 ? consonants[0] : (firstWord[1] || 'X');
      code = firstWord[0] + middleChar + secondWord[0];
    } else if (words.length >= 3) {
      code = words.slice(0, 3).map(w => w[0]).join('');
    }
    return code.padEnd(3, 'X').substring(0, 3);
  }

  async createJob(data: any) {
    // Generate a job code if not provided (e.g. CVE20261234)
    const roleCode = this.generateRoleCode(data.title || 'Job');
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const jobCode = data.jobCode || `${roleCode}${currentYear}${randomNum}`;
    
    let admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await this.prisma.user.create({
        data: {
          email: 'admin@skyoconsultancy.com',
          passwordHash: 'dummyhash',
          role: 'ADMIN',
          isVerified: true
        }
      });
    }

    const job = await this.prisma.job.create({
      data: {
        title: data.title,
        locationCity: data.locationCity,
        locationState: data.locationState,
        experienceLevel: data.experienceLevel || 'Entry Level',
        workMode: data.workMode || 'Remote',
        jobType: data.jobType || 'Full Time',
        description: data.description,
        requirements: data.requirements || '',
        jobCode,
        categoryId: data.categoryId || null,
        salary: data.salary,
        salaryType: data.salaryType || 'Month',
        salaryVisible: data.salaryVisible !== undefined ? data.salaryVisible : true,
        recruitmentPosition: data.recruitmentPosition,
        vacancyCount: data.vacancyCount || 1,
        shiftTimings: data.shiftTimings,
        benefits: data.benefits,
        generalComments: data.generalComments,
        facebookLink: data.facebookLink,
        instagramLink: data.instagramLink,
        linkedinLink: data.linkedinLink,
        fieldVisibility: data.fieldVisibility || {},

        createdByAdmin: data.employerId ? undefined : {
          connect: { id: admin.id }
        },
        employer: data.employerId ? {
          connect: { id: data.employerId }
        } : undefined,
        approvalStatus: data.employerId ? 'PENDING_APPROVAL' : 'APPROVED',
      },
    });

    // If an employer created the job, send email notification to admin
    if (data.employerId) {
      try {
        const employer = await this.prisma.user.findUnique({
          where: { id: data.employerId },
          include: { employerProfile: true }
        });
        if (employer && admin) {
          const companyName = employer.employerProfile?.companyName || `${employer.firstName} Company`;
          await this.mailService.sendAdminNewJobRequestEmail(admin.email, data.title, companyName);
        }
      } catch (e) {
        console.error('Failed to send admin notification for new job request', e);
      }
    }

    return job;
  }

  async findAllJobs() {
    const jobs = await this.prisma.job.findMany({
      where: { approvalStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { 
        category: true,
        _count: {
          select: {
            applications: {
              where: { isReviewed: true }
            }
          }
        }
      }
    });
    return jobs.map(job => ({
      ...job,
      category: job.category?.name || 'Uncategorized',
      reviewedApplicationsCount: job._count.applications
    }));
  }

  async findAllAdminJobs() {
    const jobs = await this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: { 
        category: true,
        _count: {
          select: { applications: { where: { isReviewed: true } } }
        }
      }
    });
    return jobs.map(job => ({
      ...job,
      category: job.category?.name || 'Uncategorized',
      reviewedApplicationsCount: job._count.applications
    }));
  }

  async findJobsByEmployer(employerId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { employerId },
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });
    return jobs.map(job => ({
      ...job,
      category: job.category?.name || 'Uncategorized'
    }));
  }

  async findJobById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { 
        category: true,
        _count: {
          select: {
            applications: {
              where: { isReviewed: true }
            }
          }
        },
        employer: {
          include: {
            employerProfile: true
          }
        }
      }
    });
    if (!job) return null;
    return {
      ...job,
      category: job.category?.name || 'Uncategorized',
      reviewedApplicationsCount: job._count.applications
    };
  }

  async updateJob(id: string, data: any) {
    const { newCategoryName, ...updateData } = data;
    return this.prisma.job.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteJob(id: string) {
    return this.prisma.job.delete({
      where: { id },
    });
  }

  async requestClosure(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { closureRequested: true }
    });
  }

  async approveClosure(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { 
        closureRequested: false,
        status: 'COMPLETED'
      }
    });
  }

  async repostJob(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        approvalStatus: 'PENDING_APPROVAL',
        closureRequested: false
      }
    });
  }
}
