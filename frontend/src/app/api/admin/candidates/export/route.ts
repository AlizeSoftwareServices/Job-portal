import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    const candidates = await prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      include: { 
        candidateProfile: {
          include: {
            educations: { orderBy: { startDate: 'desc' } },
            experiences: { orderBy: { startDate: 'desc' } }
          }
        } 
      }
    });

    let maxEduCount = 0;
    let maxExpCount = 0;
    candidates.forEach(c => {
      const eduLen = c.candidateProfile?.educations?.length || 0;
      const expLen = c.candidateProfile?.experiences?.length || 0;
      if (eduLen > maxEduCount) maxEduCount = eduLen;
      if (expLen > maxExpCount) maxExpCount = expLen;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Candidates');

    const baseColumns = [
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
      { header: 'Interested Field', key: 'interestFieldToWork', width: 20 },
      { header: 'Father Name', key: 'fatherName', width: 20 },
      { header: 'Father Occupation', key: 'fatherOccupation', width: 20 },
      { header: 'Mother Name', key: 'motherName', width: 20 },
      { header: 'Mother Occupation', key: 'motherOccupation', width: 20 },
      { header: 'Registered At', key: 'createdAt', width: 20 },
      { header: 'Resume', key: 'resumeUrl', width: 40 },
    ];

    const eduColumns: any[] = [];
    for (let i = 1; i <= maxEduCount; i++) {
      eduColumns.push(
        { header: `Edu ${i} Institution`, key: `edu_${i}_inst`, width: 25 },
        { header: `Edu ${i} Degree`, key: `edu_${i}_deg`, width: 20 },
        { header: `Edu ${i} Field`, key: `edu_${i}_field`, width: 20 },
        { header: `Edu ${i} Start`, key: `edu_${i}_start`, width: 15 },
        { header: `Edu ${i} End`, key: `edu_${i}_end`, width: 15 }
      );
    }

    const expColumns: any[] = [];
    for (let i = 1; i <= maxExpCount; i++) {
      expColumns.push(
        { header: `Exp ${i} Company`, key: `exp_${i}_comp`, width: 25 },
        { header: `Exp ${i} Title`, key: `exp_${i}_title`, width: 20 },
        { header: `Exp ${i} Desc`, key: `exp_${i}_desc`, width: 30 },
        { header: `Exp ${i} Start`, key: `exp_${i}_start`, width: 15 },
        { header: `Exp ${i} End`, key: `exp_${i}_end`, width: 15 }
      );
    }

    worksheet.columns = [...baseColumns, ...eduColumns, ...expColumns];

    candidates.forEach(cand => {
      const profile = cand.candidateProfile;
      const rowData: any = {
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
        interestFieldToWork: profile?.interestFieldToWork?.join(', ') || 'N/A',
        fatherName: profile?.fatherName || 'N/A',
        fatherOccupation: profile?.fatherOccupation || 'N/A',
        motherName: profile?.motherName || 'N/A',
        motherOccupation: profile?.motherOccupation || 'N/A',
        createdAt: cand.createdAt.toLocaleDateString(),
        resumeUrl: profile?.resumeUrl ? { text: 'View Resume', hyperlink: profile.resumeUrl } : 'Not Uploaded',
      };

      for (let i = 0; i < maxEduCount; i++) {
        const edu = profile?.educations?.[i];
        rowData[`edu_${i+1}_inst`] = edu?.institution || 'N/A';
        rowData[`edu_${i+1}_deg`] = edu?.degree || 'N/A';
        rowData[`edu_${i+1}_field`] = edu?.fieldOfStudy || 'N/A';
        rowData[`edu_${i+1}_start`] = edu?.startDate ? edu.startDate.toLocaleDateString() : 'N/A';
        rowData[`edu_${i+1}_end`] = edu?.endDate ? edu.endDate.toLocaleDateString() : (edu ? 'Present' : 'N/A');
      }

      for (let i = 0; i < maxExpCount; i++) {
        const exp = profile?.experiences?.[i];
        rowData[`exp_${i+1}_comp`] = exp?.company || 'N/A';
        rowData[`exp_${i+1}_title`] = exp?.title || 'N/A';
        rowData[`exp_${i+1}_desc`] = exp?.description || 'N/A';
        rowData[`exp_${i+1}_start`] = exp?.startDate ? exp.startDate.toLocaleDateString() : 'N/A';
        rowData[`exp_${i+1}_end`] = exp?.endDate ? exp.endDate.toLocaleDateString() : (exp ? 'Present' : 'N/A');
      }

      worksheet.addRow(rowData);
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
