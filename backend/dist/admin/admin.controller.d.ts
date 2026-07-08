import type { Response } from 'express';
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
    exportApplications(jobId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getEmployers(): Promise<({
        employerProfile: {
            id: string;
            userId: string;
            companyName: string;
            companyWebsite: string | null;
            industry: string | null;
            companyLogoUrl: string | null;
            companyLocation: string | null;
            hrName: string | null;
            hrContactNumber: string | null;
            officialMailId: string | null;
            secondaryContactNumber: string | null;
        } | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        firstName: string | null;
        lastName: string | null;
        countryCode: string | null;
        phone: string | null;
        isVerified: boolean;
        refreshToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    exportEmployers(res: Response): Promise<Response<any, Record<string, any>>>;
    exportJobs(res: Response): Promise<Response<any, Record<string, any>>>;
    exportCandidates(res: Response): Promise<Response<any, Record<string, any>>>;
    assignEmployer(applicationId: string, employerId: string): Promise<{
        id: string;
        candidateId: string | null;
        jobId: string | null;
        referenceNumber: string | null;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
        phone: string | null;
        noticePeriod: string | null;
        street: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        zipCode: string | null;
        resumeUrl: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        adminRating: number | null;
        adminNotes: string | null;
        isReviewed: boolean;
        isPassedToEmployer: boolean;
        qualification: string | null;
        experience: string | null;
        skills: string | null;
        assignedEmployerId: string | null;
        appliedAt: Date;
        updatedAt: Date;
    }>;
}
