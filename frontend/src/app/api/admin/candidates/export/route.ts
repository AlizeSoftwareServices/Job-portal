import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    const candidates = await prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      include: { candidateProfile: true }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Candidates');

    worksheet.columns = [
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Primary Contact', key: 'phone', width: 20 },
      { header: 'Secondary Contact', key: 'secondaryContactNumber', width: 20 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'Marital Status', key: 'maritalStatus', width: 15 },
      { header: 'Current Stay', key: 'currentStay', width: 20 },
      { header: 'Native Place', key: 'nativePlace', width: 20 },
      { header: 'Qualification', key: 'qualification', width: 20 },
      { header: 'Experience (Years)', key: 'experience', width: 15 },
      { header: 'Current Working Details', key: 'currentWorkingDetails', width: 25 },
      { header: 'Expected Salary', key: 'expectedSalary', width: 15 },
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
        secondaryContactNumber: profile?.secondaryContactNumber || 'N/A',
        gender: profile?.gender || 'N/A',
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toLocaleDateString() : 'N/A',
        maritalStatus: profile?.maritalStatus || 'N/A',
        currentStay: profile?.currentStay || 'N/A',
        nativePlace: profile?.nativePlace || 'N/A',
        qualification: profile?.educationQualification || 'N/A',
        experience: profile?.totalWorkExperienceYears || 'N/A',
        currentWorkingDetails: profile?.currentWorkingDetails || 'N/A',
        expectedSalary: profile?.expectedSalary || 'N/A',
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
    const fileName = `Candidates_List.xlsx`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename=${fileName}`);

    return new NextResponse(buffer as any, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
