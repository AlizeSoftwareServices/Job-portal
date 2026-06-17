import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalJobs = await this.prisma.job.count();
    const activeJobs = await this.prisma.job.count({ where: { status: 'ACTIVE' } });
    const totalApplications = await this.prisma.application.count();
    
    // Group jobs by category
    const jobsByCategory = await (this.prisma as any).category.findMany({
      include: {
        _count: {
          select: { jobs: true }
        }
      }
    });

    const categoryBreakdown = jobsByCategory.map((cat: any) => ({
      name: cat.name,
      count: cat._count.jobs
    }));

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      categoryBreakdown
    };
  }
}
