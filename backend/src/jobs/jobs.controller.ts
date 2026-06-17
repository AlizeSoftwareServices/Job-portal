import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async createJob(@Body() createJobDto: any) {
    // For now, since auth is not fully hooked up to req.user,
    // we require the frontend to pass createdByAdminId.
    // In a real app, we extract it from JWT.
    
    // If no admin ID is provided, use a hardcoded fallback or the first admin in DB (for demo purposes)
    // Actually, we must ensure it exists. The frontend will pass a dummy admin ID if not logged in.
    return this.jobsService.createJob(createJobDto);
  }

  @Get()
  async findAll() {
    return this.jobsService.findAllJobs();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findJobById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateJobDto: any) {
    return this.jobsService.updateJob(id, updateJobDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobsService.deleteJob(id);
  }
}
