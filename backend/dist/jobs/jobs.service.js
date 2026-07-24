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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const mail_service_1 = require("../mail/mail.service");
let JobsService = class JobsService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    generateRoleCode(title) {
        const cleanTitle = title.replace(/[^a-zA-Z ]/g, '').toUpperCase();
        const words = cleanTitle.split(/\s+/).filter(w => w.length > 0);
        let code = 'JOB';
        if (words.length === 1 && words[0].length >= 3) {
            code = words[0].substring(0, 3);
        }
        else if (words.length === 2) {
            const firstWord = words[0];
            const secondWord = words[1];
            const consonants = firstWord.substring(1).replace(/[AEIOU]/g, '');
            const middleChar = consonants.length > 0 ? consonants[0] : (firstWord[1] || 'X');
            code = firstWord[0] + middleChar + secondWord[0];
        }
        else if (words.length >= 3) {
            code = words.slice(0, 3).map(w => w[0]).join('');
        }
        return code.padEnd(3, 'X').substring(0, 3);
    }
    async createJob(data) {
        const roleCode = this.generateRoleCode(data.title || 'Job');
        const currentYear = new Date().getFullYear();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const jobCode = data.jobCode || `${roleCode}${currentYear}${randomNum}`;
        let admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!admin) {
            admin = await this.prisma.user.create({
                data: {
                    email: 'alizesoftwareservicesllp@gmail.com',
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
            }
            catch (e) {
                console.error('Failed to send admin notification for new job request', e);
            }
        }
        return job;
    }
    async findAllJobs() {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const jobs = await this.prisma.job.findMany({
            where: {
                approvalStatus: 'APPROVED',
                OR: [
                    { status: 'ACTIVE' },
                    {
                        status: 'COMPLETED',
                        updatedAt: { gte: twoDaysAgo }
                    }
                ]
            },
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
    async findJobsByEmployer(employerId) {
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
    async findJobById(id) {
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
        if (!job)
            return null;
        return {
            ...job,
            category: job.category?.name || 'Uncategorized',
            reviewedApplicationsCount: job._count.applications
        };
    }
    async updateJob(id, data) {
        const { newCategoryName, ...updateData } = data;
        return this.prisma.job.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteJob(id) {
        return this.prisma.job.delete({
            where: { id },
        });
    }
    async requestClosure(id) {
        return this.prisma.job.update({
            where: { id },
            data: { closureRequested: true }
        });
    }
    async approveClosure(id) {
        return this.prisma.job.update({
            where: { id },
            data: {
                closureRequested: false,
                status: 'COMPLETED'
            }
        });
    }
    async repostJob(id) {
        return this.prisma.job.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                approvalStatus: 'PENDING_APPROVAL',
                closureRequested: false
            }
        });
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map