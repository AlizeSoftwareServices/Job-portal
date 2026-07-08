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
          ...(data.candidateProfile.fullName !== undefined && { fullName: data.candidateProfile.fullName }),
          ...(data.candidateProfile.phone !== undefined && { phone: data.candidateProfile.phone }),
          ...(data.candidateProfile.address !== undefined && { address: data.candidateProfile.address }),
          ...(data.candidateProfile.summary !== undefined && { summary: data.candidateProfile.summary }),
          ...(data.candidateProfile.expectedSalary !== undefined && { expectedSalary: data.candidateProfile.expectedSalary }),
          ...(data.candidateProfile.preferredLocation !== undefined && { preferredLocation: data.candidateProfile.preferredLocation }),
          ...(data.candidateProfile.preferredJobType !== undefined && { preferredJobType: data.candidateProfile.preferredJobType }),
          ...(data.candidateProfile.gender !== undefined && { gender: data.candidateProfile.gender }),
          ...(data.candidateProfile.dateOfBirth !== undefined && { dateOfBirth: data.candidateProfile.dateOfBirth ? new Date(data.candidateProfile.dateOfBirth) : null }),
          ...(data.candidateProfile.maritalStatus !== undefined && { maritalStatus: data.candidateProfile.maritalStatus }),
          ...(data.candidateProfile.secondaryContactNumber !== undefined && { secondaryContactNumber: data.candidateProfile.secondaryContactNumber }),
          ...(data.candidateProfile.educationQualification !== undefined && { educationQualification: data.candidateProfile.educationQualification }),
          ...(data.candidateProfile.totalWorkExperienceYears !== undefined && { totalWorkExperienceYears: data.candidateProfile.totalWorkExperienceYears }),
          ...(data.candidateProfile.currentWorkingDetails !== undefined && { currentWorkingDetails: data.candidateProfile.currentWorkingDetails }),
          ...(data.candidateProfile.fatherName !== undefined && { fatherName: data.candidateProfile.fatherName }),
          ...(data.candidateProfile.fatherOccupation !== undefined && { fatherOccupation: data.candidateProfile.fatherOccupation }),
          ...(data.candidateProfile.motherName !== undefined && { motherName: data.candidateProfile.motherName }),
          ...(data.candidateProfile.motherOccupation !== undefined && { motherOccupation: data.candidateProfile.motherOccupation }),
          ...(data.candidateProfile.currentSalary !== undefined && { currentSalary: data.candidateProfile.currentSalary }),
          ...(data.candidateProfile.currentStay !== undefined && { currentStay: data.candidateProfile.currentStay }),
          ...(data.candidateProfile.nativePlace !== undefined && { nativePlace: data.candidateProfile.nativePlace }),
          ...(data.candidateProfile.interestFieldToWork !== undefined && { interestFieldToWork: data.candidateProfile.interestFieldToWork }),
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

    const fullUpdatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: {
          include: {
            skills: true,
            experiences: true,
            educations: true,
            projects: true,
            certifications: true
          }
        },
        savedJobs: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
                jobCode: true,
                locationCity: true,
                locationState: true,
                jobType: true,
                workMode: true,
                fieldVisibility: true,
                category: { select: { name: true } }
              }
            }
          }
        },
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', user: fullUpdatedUser }, { status: 200 });
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
