import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): Promise<{
        candidateProfile: ({
            experiences: {
                id: string;
                profileId: string;
                company: string;
                title: string;
                startDate: Date;
                endDate: Date | null;
                description: string | null;
            }[];
            educations: {
                id: string;
                profileId: string;
                institution: string;
                degree: string;
                fieldOfStudy: string | null;
                startDate: Date;
                endDate: Date | null;
            }[];
            skills: {
                id: string;
                profileId: string;
                name: string;
            }[];
            projects: {
                id: string;
                profileId: string;
                name: string;
                description: string | null;
                link: string | null;
            }[];
            certifications: {
                id: string;
                profileId: string;
                name: string;
                issuer: string;
                dateIssued: Date | null;
            }[];
        } & {
            id: string;
            userId: string;
            fullName: string;
            phone: string | null;
            address: string | null;
            summary: string | null;
            avatarUrl: string | null;
            resumeUrl: string | null;
            expectedSalary: string | null;
            preferredLocation: string | null;
            preferredJobType: string | null;
        }) | null;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        firstName: string | null;
        lastName: string | null;
        countryCode: string | null;
        phone: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: any, body: any): Promise<{
        message: string;
        emailChanged: boolean;
        profile: {
            id: string;
            userId: string;
            fullName: string;
            phone: string | null;
            address: string | null;
            summary: string | null;
            avatarUrl: string | null;
            resumeUrl: string | null;
            expectedSalary: string | null;
            preferredLocation: string | null;
            preferredJobType: string | null;
        };
    }>;
    deleteProfile(req: any): Promise<{
        message: string;
    }>;
    uploadResume(req: any, file: any): {
        resumeUrl: string;
    };
    uploadAvatar(req: any, file: any): {
        avatarUrl: string;
    };
}
