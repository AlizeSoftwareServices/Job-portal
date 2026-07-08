import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    const employers = await prisma.user.findMany({
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
    const fileName = `Employers_List.xlsx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename=${fileName}`);

    return new NextResponse(buffer as any, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
