import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.job.create({
      data: {
        title: data.title,
        locationCity: data.locationCity,
        locationState: data.locationState,
        experienceLevel: data.experienceLevel || 'Entry Level',
        workMode: data.workMode || 'Remote',
        jobType: data.jobType || 'Full Time',
        description: data.description,
        requirements: data.requirements || '',
        categoryId: data.categoryId || null,
        salary: data.salary,
        salaryType: data.salaryType || 'Month',
        salaryVisible: data.salaryVisible !== undefined ? data.salaryVisible : true,
        facebookLink: data.facebookLink,
        instagramLink: data.instagramLink,
        linkedinLink: data.linkedinLink,

        createdByAdmin: {
          connect: { id: admin.id }
        }
      },
    });
  }

  async findAllJobs() {
    const jobs = await this.prisma.job.findMany({
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
}
