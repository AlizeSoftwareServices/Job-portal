import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await verifyAuth(req);
    // ...
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    
    const { id: jobId } = await params;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { 
        applications: { include: { candidate: true } },
        category: true,
        employer: true 
      }
    });

    if (!job) {
      return new NextResponse('Job not found', { status: 404 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Job Details');

    worksheet.columns = [
      { header: 'Field', key: 'field', width: 25 },
      { header: 'Value', key: 'value', width: 60 },
    ];

    const fields = [
      { field: 'Job Code', value: job.jobCode },
      { field: 'Job Title', value: job.title },
      { field: 'Recruitment Position', value: job.recruitmentPosition || 'N/A' },
      { field: 'Department', value: job.department || 'N/A' },
      { field: 'Category', value: job.category?.name || 'N/A' },
      { field: 'No. of Vacancies', value: job.vacancyCount.toString() },
      { field: 'Location City', value: job.locationCity },
      { field: 'Location State', value: job.locationState },
      { field: 'Location Country', value: job.locationCountry },
      { field: 'Experience Level', value: job.experienceLevel },
      { field: 'Work Mode', value: job.workMode },
      { field: 'Job Type', value: job.jobType },
      { field: 'Shift Timings', value: job.shiftTimings || 'N/A' },
      { field: 'Salary Type', value: job.salaryType || 'Month' },
      { field: 'Salary Amount', value: job.salary ? job.salary : (job.salaryMin && job.salaryMax ? `${job.salaryMin} - ${job.salaryMax}` : 'N/A') },
      { field: 'Education Required', value: job.educationReq || 'N/A' },
      { field: 'Skills Required', value: job.skills.join(', ') || 'N/A' },
      { field: 'Other Benefits', value: job.benefits || 'N/A' },
      { field: 'General Comments', value: job.generalComments || 'N/A' },
      { field: 'Description', value: job.description },
      { field: 'Requirements', value: job.requirements },
      { field: 'Status', value: job.status },
      { field: 'Approval Status', value: job.approvalStatus },
      { field: 'Created At', value: job.createdAt.toLocaleString() },
      { field: 'Employer Name', value: job.employer ? `${job.employer.firstName} ${job.employer.lastName}`.trim() : 'Admin' },
      { field: 'Employer Email', value: job.employer?.email || 'N/A' },
    ];

    fields.forEach(f => {
      worksheet.addRow(f);
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_Details.xlsx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename=${fileName}`);

    return new NextResponse(buffer as any, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
