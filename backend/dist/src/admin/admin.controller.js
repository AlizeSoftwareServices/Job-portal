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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getStats() {
        return this.adminService.getDashboardStats();
    }
    async exportApplications(jobId, res) {
        const { buffer, jobTitle } = await this.adminService.exportApplicationsToExcel(jobId);
        const fileName = `${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Applications.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.send(buffer);
    }
    getEmployers() {
        return this.adminService.getEmployers();
    }
    async exportEmployers(res) {
        const { buffer } = await this.adminService.exportEmployersToExcel();
        const fileName = `Employers_List.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.send(buffer);
    }
    async exportJobs(res) {
        const { buffer } = await this.adminService.exportJobsToExcel();
        const fileName = `Jobs_List.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.send(buffer);
    }
    async exportCandidates(res) {
        const { buffer } = await this.adminService.exportCandidatesToExcel();
        const fileName = `Candidates_List.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.send(buffer);
    }
    async assignEmployer(applicationId, employerId) {
        return this.adminService.assignApplicationToEmployer(applicationId, employerId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('jobs/:jobId/export'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportApplications", null);
__decorate([
    (0, common_1.Get)('employers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getEmployers", null);
__decorate([
    (0, common_1.Get)('employers/export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportEmployers", null);
__decorate([
    (0, common_1.Get)('jobs/export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportJobs", null);
__decorate([
    (0, common_1.Get)('candidates/export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportCandidates", null);
__decorate([
    (0, common_1.Get)('applications/:applicationId/assign-employer/:employerId'),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Param)('employerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignEmployer", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map