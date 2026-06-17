import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    application: import(".prisma/client").Prisma.ApplicationDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    job: import(".prisma/client").Prisma.JobDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    user: import(".prisma/client").Prisma.UserDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    candidateProfile: import(".prisma/client").Prisma.CandidateProfileDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    experience: import(".prisma/client").Prisma.ExperienceDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    education: import(".prisma/client").Prisma.EducationDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    skill: import(".prisma/client").Prisma.SkillDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    certification: import(".prisma/client").Prisma.CertificationDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    project: import(".prisma/client").Prisma.ProjectDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    interview: import(".prisma/client").Prisma.InterviewDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    category: import(".prisma/client").Prisma.CategoryDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    otpCode: import(".prisma/client").Prisma.OtpCodeDelegate<import("@prisma/client/runtime/library").DefaultArgs>;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
