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
      include: { applications: { include: { candidate: true } } }
    });

    if (!job) {
      return new NextResponse('Job not found', { status: 404 });
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

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `${job.title.replace(/[^a-zA-Z0-9]/g, '_')}_Applications.xlsx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename=${fileName}`);

    return new NextResponse(buffer as any, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
