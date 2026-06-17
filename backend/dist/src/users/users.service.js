"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                candidateProfile: {
                    include: {
                        experiences: true,
                        educations: true,
                        skills: true,
                        projects: true,
                        certifications: true
                    }
                }
            }
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { passwordHash, refreshToken, ...result } = user;
        return result;
    }
    async updateProfile(userId, data) {
        let emailChanged = false;
        if (data.email) {
            const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
            if (existingUser && existingUser.email !== data.email) {
                const emailTaken = await this.prisma.user.findUnique({ where: { email: data.email } });
                if (emailTaken) {
                    throw new common_1.BadRequestException('Email is already taken');
                }
                emailChanged = true;
            }
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(data.firstName && { firstName: data.firstName }),
                ...(data.lastName && { lastName: data.lastName }),
                ...(data.phone && { phone: data.phone }),
                ...(data.countryCode && { countryCode: data.countryCode }),
                ...(data.email && { email: data.email })
            }
        });
        const updatedProfile = await this.prisma.candidateProfile.update({
            where: { userId },
            data: {
                ...(data.firstName && data.lastName && { fullName: `${data.firstName} ${data.lastName}` }),
                ...((data.phone || data.countryCode) && { phone: `${data.countryCode || ''} ${data.phone || ''}`.trim() }),
                ...(data.address !== undefined && { address: data.address }),
                ...(data.summary !== undefined && { summary: data.summary }),
                ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
                ...(data.resumeUrl !== undefined && { resumeUrl: data.resumeUrl }),
                ...(data.expectedSalary !== undefined && { expectedSalary: data.expectedSalary }),
                ...(data.preferredLocation !== undefined && { preferredLocation: data.preferredLocation }),
                ...(data.preferredJobType !== undefined && { preferredJobType: data.preferredJobType }),
            }
        });
        if (data.educations && Array.isArray(data.educations)) {
            await this.prisma.education.deleteMany({ where: { profileId: updatedProfile.id } });
            if (data.educations.length > 0) {
                await this.prisma.education.createMany({
                    data: data.educations.map((edu) => ({
                        profileId: updatedProfile.id,
                        institution: edu.institution,
                        degree: edu.degree,
                        fieldOfStudy: edu.fieldOfStudy,
                        startDate: new Date(edu.startDate),
                        endDate: edu.endDate ? new Date(edu.endDate) : null,
                    }))
                });
            }
        }
        if (data.experiences && Array.isArray(data.experiences)) {
            await this.prisma.experience.deleteMany({ where: { profileId: updatedProfile.id } });
            if (data.experiences.length > 0) {
                await this.prisma.experience.createMany({
                    data: data.experiences.map((exp) => ({
                        profileId: updatedProfile.id,
                        company: exp.company,
                        title: exp.title,
                        description: exp.description,
                        startDate: new Date(exp.startDate),
                        endDate: exp.endDate ? new Date(exp.endDate) : null,
                    }))
                });
            }
        }
        if (data.skills && Array.isArray(data.skills)) {
            await this.prisma.skill.deleteMany({ where: { profileId: updatedProfile.id } });
            if (data.skills.length > 0) {
                await this.prisma.skill.createMany({
                    data: data.skills.map((skill) => ({
                        profileId: updatedProfile.id,
                        name: skill,
                    }))
                });
            }
        }
        return { message: 'Profile updated successfully', emailChanged, profile: updatedProfile };
    }
    async deleteProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.prisma.user.delete({
            where: { id: userId }
        });
        return { message: 'Account deleted successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map