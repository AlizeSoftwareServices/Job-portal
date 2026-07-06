import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
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
            certifications: {
                id: string;
                profileId: string;
                name: string;
                issuer: string;
                dateIssued: Date | null;
            }[];
            projects: {
                id: string;
                profileId: string;
                name: string;
                description: string | null;
                link: string | null;
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
            gender: string | null;
            dateOfBirth: Date | null;
            maritalStatus: string | null;
            secondaryContactNumber: string | null;
            educationQualification: string | null;
            totalWorkExperienceYears: string | null;
            currentWorkingDetails: string | null;
            fatherName: string | null;
            fatherOccupation: string | null;
            motherName: string | null;
            motherOccupation: string | null;
            currentSalary: string | null;
            currentStay: string | null;
            nativePlace: string | null;
            interestFieldToWork: string[];
        }) | null;
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
    updateProfile(userId: string, data: any): Promise<{
        message: string;
        emailChanged: boolean;
        profile: any;
    }>;
    deleteProfile(userId: string): Promise<{
        message: string;
    }>;
}
