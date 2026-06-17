import { PrismaService } from '../prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalJobs: number;
        activeJobs: number;
        totalApplications: number;
        categoryBreakdown: any;
    }>;
}
