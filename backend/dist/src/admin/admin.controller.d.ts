import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        totalJobs: number;
        activeJobs: number;
        totalApplications: number;
        categoryBreakdown: any;
    }>;
}
