import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        candidateProfile: {
          include: {
            experiences: true,
            educations: true,
            skills: true,
            projects: true,
            certifications: true
          }
        },
        employerProfile: true,
        savedJobs: {
          include: {
            job: true
          }
        }
      }
    });

    if (!dbUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    const { passwordHash, ...result } = dbUser as any;
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const data = await req.json();
    const userId = user.sub;

    if (data.email) {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (existingUser && existingUser.email !== data.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
        if (emailTaken) return NextResponse.json({ message: 'Email is already taken' }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone && { phone: data.phone }),
        ...(data.countryCode && { countryCode: data.countryCode }),
        ...(data.email && { email: data.email })
      }
    });

    let updatedProfile = null;
    if (user.role === 'CANDIDATE' && data.candidateProfile) {
      updatedProfile = await prisma.candidateProfile.update({
        where: { userId },
        data: {
          ...(data.candidateProfile.fullName && { fullName: data.candidateProfile.fullName }),
          ...(data.candidateProfile.phone && { phone: data.candidateProfile.phone }),
          ...(data.candidateProfile.address && { address: data.candidateProfile.address }),
          ...(data.candidateProfile.summary && { summary: data.candidateProfile.summary }),
          ...(data.candidateProfile.expectedSalary && { expectedSalary: data.candidateProfile.expectedSalary }),
          ...(data.candidateProfile.preferredLocation && { preferredLocation: data.candidateProfile.preferredLocation }),
          ...(data.candidateProfile.preferredJobType && { preferredJobType: data.candidateProfile.preferredJobType }),
          ...(data.candidateProfile.gender && { gender: data.candidateProfile.gender }),
          ...(data.candidateProfile.dateOfBirth && { dateOfBirth: new Date(data.candidateProfile.dateOfBirth) }),
          ...(data.candidateProfile.maritalStatus && { maritalStatus: data.candidateProfile.maritalStatus }),
          ...(data.candidateProfile.secondaryContactNumber && { secondaryContactNumber: data.candidateProfile.secondaryContactNumber }),
          ...(data.candidateProfile.educationQualification && { educationQualification: data.candidateProfile.educationQualification }),
          ...(data.candidateProfile.totalWorkExperienceYears && { totalWorkExperienceYears: data.candidateProfile.totalWorkExperienceYears }),
          ...(data.candidateProfile.currentWorkingDetails && { currentWorkingDetails: data.candidateProfile.currentWorkingDetails }),
          ...(data.candidateProfile.fatherName && { fatherName: data.candidateProfile.fatherName }),
          ...(data.candidateProfile.fatherOccupation && { fatherOccupation: data.candidateProfile.fatherOccupation }),
          ...(data.candidateProfile.motherName && { motherName: data.candidateProfile.motherName }),
          ...(data.candidateProfile.motherOccupation && { motherOccupation: data.candidateProfile.motherOccupation }),
          ...(data.candidateProfile.currentSalary && { currentSalary: data.candidateProfile.currentSalary }),
          ...(data.candidateProfile.currentStay && { currentStay: data.candidateProfile.currentStay }),
          ...(data.candidateProfile.nativePlace && { nativePlace: data.candidateProfile.nativePlace }),
          ...(data.candidateProfile.interestFieldToWork && { interestFieldToWork: data.candidateProfile.interestFieldToWork }),
          ...(data.candidateProfile.resumeUrl !== undefined && { resumeUrl: data.candidateProfile.resumeUrl }),
          ...(data.candidateProfile.avatarUrl !== undefined && { avatarUrl: data.candidateProfile.avatarUrl }),
          // Handle relationships (delete old and create new)
          ...(data.candidateProfile.skills && {
            skills: {
              deleteMany: {},
              create: data.candidateProfile.skills.map((name: string) => ({ name }))
            }
          }),
          ...(data.candidateProfile.educations && {
            educations: {
              deleteMany: {},
              create: data.candidateProfile.educations
            }
          }),
          ...(data.candidateProfile.experiences && {
            experiences: {
              deleteMany: {},
              create: data.candidateProfile.experiences
            }
          })
        }
      });
    } else if (user.role === 'EMPLOYER' && data.employerProfile) {
      updatedProfile = await prisma.employerProfile.update({
        where: { userId },
        data: {
          ...(data.employerProfile.companyName && { companyName: data.employerProfile.companyName }),
          ...(data.employerProfile.companyWebsite && { companyWebsite: data.employerProfile.companyWebsite }),
          ...(data.employerProfile.industry && { industry: data.employerProfile.industry }),
          ...(data.employerProfile.companyLocation && { companyLocation: data.employerProfile.companyLocation }),
          ...(data.employerProfile.hrName && { hrName: data.employerProfile.hrName }),
          ...(data.employerProfile.hrContactNumber && { hrContactNumber: data.employerProfile.hrContactNumber }),
          ...(data.employerProfile.officialMailId && { officialMailId: data.employerProfile.officialMailId }),
          ...(data.employerProfile.secondaryContactNumber && { secondaryContactNumber: data.employerProfile.secondaryContactNumber }),
          ...(data.employerProfile.companyLogoUrl !== undefined && { companyLogoUrl: data.employerProfile.companyLogoUrl })
        }
      });
    }

    return NextResponse.json({ message: 'Profile updated successfully', profile: updatedProfile }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const existingUser = await prisma.user.findUnique({ where: { id: user.sub } });
    if (!existingUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    await prisma.user.delete({ where: { id: user.sub } });
    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
