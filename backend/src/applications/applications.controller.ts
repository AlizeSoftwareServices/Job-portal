import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationsService } from './applications.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('resume', {
    storage: diskStorage({
      destination: './uploads/resumes',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async applyForJob(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    const resumeUrl = file ? `/uploads/resumes/${file.filename}` : undefined;
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
}
