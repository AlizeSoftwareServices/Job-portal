import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-data')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('jobs/:jobId/export')
  async exportApplications(@Param('jobId') jobId: string, @Res() res: Response) {
    const { buffer, jobTitle } = await this.adminService.exportApplicationsToExcel(jobId);
    const fileName = `${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Applications.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    return res.send(buffer);
  }

  @Get('employers')
  getEmployers() {
    return this.adminService.getEmployers();
  }

  @Get('employers/export')
  async exportEmployers(@Res() res: Response) {
    const { buffer } = await this.adminService.exportEmployersToExcel();
    const fileName = `Employers_List.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    return res.send(buffer);
  }

  @Get('jobs/export')
  async exportJobs(@Res() res: Response) {
    const { buffer } = await this.adminService.exportJobsToExcel();
    const fileName = `Jobs_List.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    return res.send(buffer);
  }

  @Get('candidates/export')
  async exportCandidates(@Res() res: Response) {
    const { buffer } = await this.adminService.exportCandidatesToExcel();
    const fileName = `Candidates_List.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    return res.send(buffer);
  }

  @Get('applications/:applicationId/assign-employer/:employerId')
  async assignEmployer(
    @Param('applicationId') applicationId: string,
    @Param('employerId') employerId: string
  ) {
    return this.adminService.assignApplicationToEmployer(applicationId, employerId);
  }
}
