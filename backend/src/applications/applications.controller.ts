import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Patch, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { cloudinaryResumeStorage } from '../cloudinary.config';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('resume', {
    storage: cloudinaryResumeStorage,
    limits: {
      fileSize: 100 * 1024, // 100 KB max
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/msword'
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PDF and DOCX files are allowed'), false);
      }
    }
  }))
  async applyForJob(
    @UploadedFile() file: any,
    @Body() body: any
  ) {
    const resumeUrl = file ? file.path : undefined;
    return this.applicationsService.createApplication({
      ...body,
      resumeUrl,
    });
  }

  @Get()
  getAllApplications() {
    return this.applicationsService.getAllApplications();
  }

  @Get('job/:jobId')
  getApplicationsByJob(@Param('jobId') jobId: string) {
    return this.applicationsService.getApplicationsByJob(jobId);
  }

  @Patch(':id/status')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: any
  ) {
    return this.applicationsService.updateApplicationStatus(id, status);
  }

  @Patch(':id/review')
  markAsReviewed(@Param('id') id: string) {
    return this.applicationsService.markAsReviewed(id);
  }

  @Post(':id/send-email')
  sendCustomEmail(
    @Param('id') id: string,
    @Body('subject') subject: string,
    @Body('message') message: string
  ) {
    return this.applicationsService.sendCustomEmail(id, subject, message);
  }

  @Get('track/:ref')
  trackApplication(@Param('ref') ref: string) {
    return this.applicationsService.getTrackApplication(ref);
  }

  @Get('employer/:employerId/direct')
  getEmployerDirectApplications(@Param('employerId') employerId: string) {
    return this.applicationsService.getEmployerDirectApplications(employerId);
  }

  @Get('employer/:employerId/skyo')
  getEmployerSkyoApplications(@Param('employerId') employerId: string) {
    return this.applicationsService.getEmployerSkyoApplications(employerId);
  }

  @Patch(':id/pass-to-employer')
  passApplicationToEmployer(@Param('id') id: string) {
    return this.applicationsService.passApplicationToEmployer(id);
  }
}
