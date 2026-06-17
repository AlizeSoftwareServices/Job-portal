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
let JobsService = class JobsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                jobCode,
                categoryId: data.categoryId,
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
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JobsService);
//# sourceMappingURL=jobs.service.js.map