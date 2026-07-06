import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalJobs = await this.prisma.job.count();
    const activeJobs = await this.prisma.job.count({ where: { status: 'ACTIVE' } });
    const totalApplications = await this.prisma.application.count();
    
    // Group jobs by category
    const jobsByCategory = await (this.prisma as any).category.findMany({
      include: {
        _count: {
          select: { jobs: true }
        }
      }
    });

    const categoryBreakdown = jobsByCategory.map((cat: any) => ({
      name: cat.name,
      count: cat._count.jobs
    }));

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      categoryBreakdown
    };
  }

  async exportApplicationsToExcel(jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { applications: { include: { candidate: true } } }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applications');

    worksheet.columns = [
      { header: 'Reference ID', key: 'referenceNumber', width: 15 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Notice Period', key: 'noticePeriod', width: 15 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Applied At', key: 'appliedAt', width: 20 },
      { header: 'Resume URL', key: 'resumeUrl', width: 50 },
    ];

    job.applications.forEach(app => {
      worksheet.addRow({
        referenceNumber: app.referenceNumber || 'N/A',
        firstName: app.firstName || app.candidate?.firstName || 'Unknown',
        lastName: app.lastName || app.candidate?.lastName || '',
        email: app.email || app.candidate?.email || '',
        phone: app.phone || app.candidate?.phone || '',
        noticePeriod: app.noticePeriod || 'N/A',
        status: app.status,
        appliedAt: app.appliedAt.toLocaleDateString(),
        resumeUrl: app.resumeUrl ? `https://skyo-backend.onrender.com${app.resumeUrl}` : 'N/A'
      });
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer, jobTitle: job.title };
  }

  async getEmployers() {
    return this.prisma.user.findMany({
      where: { role: 'EMPLOYER' },
      include: { employerProfile: true }
    });
  }

  async exportEmployersToExcel() {
    const employers = await this.prisma.user.findMany({
      where: { role: 'EMPLOYER' },
      include: { employerProfile: true }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employers');

    worksheet.columns = [
      { header: 'Company Name', key: 'companyName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'HR Name', key: 'hrName', width: 20 },
      { header: 'HR Contact Number', key: 'hrContactNumber', width: 20 },
      { header: 'Official Mail ID', key: 'officialMailId', width: 25 },
      { header: 'Secondary Contact Number', key: 'secondaryContactNumber', width: 25 },
      { header: 'Industry', key: 'industry', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Website', key: 'website', width: 25 },
      { header: 'Registered At', key: 'createdAt', width: 20 },
    ];

    employers.forEach(emp => {
      const profile = emp.employerProfile;
      worksheet.addRow({
        companyName: profile?.companyName || 'N/A',
        email: emp.email,
        hrName: profile?.hrName || 'N/A',
        hrContactNumber: emp.phone || profile?.hrContactNumber || 'N/A',
        officialMailId: profile?.officialMailId || 'N/A',
        secondaryContactNumber: profile?.secondaryContactNumber || 'N/A',
        industry: profile?.industry || 'N/A',
        location: profile?.companyLocation || 'N/A',
        website: profile?.companyWebsite || 'N/A',
        createdAt: emp.createdAt.toLocaleDateString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer };
  }

  async exportCandidatesToExcel() {
    const candidates = await this.prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      include: { candidateProfile: true }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Candidates');

    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'Marital Status', key: 'maritalStatus', width: 15 },
      { header: 'Secondary Contact', key: 'secondaryContactNumber', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Native Place', key: 'nativePlace', width: 20 },
      { header: 'Experience (Years)', key: 'experience', width: 15 },
      { header: 'Current Working Details', key: 'currentWorkingDetails', width: 25 },
      { header: 'Qualification', key: 'qualification', width: 20 },
      { header: 'Expected Salary', key: 'salary', width: 15 },
      { header: 'Current Salary', key: 'currentSalary', width: 15 },
      { header: 'Preferred Job Type', key: 'preferredJobType', width: 20 },
      { header: 'Interested Field', key: 'interestFieldToWork', width: 20 },
      { header: 'Father Name', key: 'fatherName', width: 20 },
      { header: 'Father Occupation', key: 'fatherOccupation', width: 20 },
      { header: 'Mother Name', key: 'motherName', width: 20 },
      { header: 'Mother Occupation', key: 'motherOccupation', width: 20 },
      { header: 'Registered At', key: 'createdAt', width: 20 },
    ];

    candidates.forEach(cand => {
      const profile = cand.candidateProfile;
      worksheet.addRow({
        fullName: profile?.fullName || `${cand.firstName || ''} ${cand.lastName || ''}`.trim() || 'N/A',
        email: cand.email,
        phone: cand.phone || profile?.phone || 'N/A',
        gender: profile?.gender || 'N/A',
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toLocaleDateString() : 'N/A',
        maritalStatus: profile?.maritalStatus || 'N/A',
        secondaryContactNumber: profile?.secondaryContactNumber || 'N/A',
        location: profile?.preferredLocation || profile?.address || 'N/A',
        nativePlace: profile?.nativePlace || 'N/A',
        experience: profile?.totalWorkExperienceYears || 'N/A',
        currentWorkingDetails: profile?.currentWorkingDetails || 'N/A',
        qualification: profile?.educationQualification || 'N/A',
        salary: profile?.expectedSalary || 'N/A',
        currentSalary: profile?.currentSalary || 'N/A',
        preferredJobType: profile?.preferredJobType || 'N/A',
        interestFieldToWork: profile?.interestFieldToWork?.join(', ') || 'N/A',
        fatherName: profile?.fatherName || 'N/A',
        fatherOccupation: profile?.fatherOccupation || 'N/A',
        motherName: profile?.motherName || 'N/A',
        motherOccupation: profile?.motherOccupation || 'N/A',
        createdAt: cand.createdAt.toLocaleDateString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer };
  }

  async exportJobsToExcel() {
    const jobs = await this.prisma.job.findMany({
      include: {
        category: true,
        employer: {
          include: { employerProfile: true }
        }
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');

    worksheet.columns = [
      { header: 'Job Code', key: 'jobCode', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Employer Company', key: 'employer', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Experience Level', key: 'experienceLevel', width: 15 },
      { header: 'Work Mode', key: 'workMode', width: 15 },
      { header: 'Job Type', key: 'jobType', width: 15 },
      { header: 'Vacancy', key: 'vacancyCount', width: 10 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Route Type', key: 'routeType', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    jobs.forEach(job => {
      worksheet.addRow({
        jobCode: job.jobCode || 'N/A',
        title: job.title || 'N/A',
        employer: job.employer?.employerProfile?.companyName || 'Admin / N/A',
        department: job.department || 'N/A',
        location: `${job.locationCity || ''}, ${job.locationState || ''}`.trim() || 'N/A',
        experienceLevel: job.experienceLevel || 'N/A',
        workMode: job.workMode || 'N/A',
        jobType: job.jobType || 'N/A',
        vacancyCount: job.vacancyCount || 0,
        status: job.status || 'N/A',
        routeType: job.routeType || 'N/A',
        createdAt: job.createdAt.toLocaleDateString(),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer };
  }

  async assignApplicationToEmployer(applicationId: string, employerId: string) {
    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        assignedEmployerId: employerId,
        isPassedToEmployer: true
      }
    });
  }
}
