import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    const jobs = await prisma.job.findMany({
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
    const fileName = `Jobs_List.xlsx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename=${fileName}`);

    return new NextResponse(buffer as Buffer, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
