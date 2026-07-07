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
        employerProfile: true
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
          ...(data.candidateProfile.title && { title: data.candidateProfile.title }),
          ...(data.candidateProfile.phone && { phone: data.candidateProfile.phone }),
          ...(data.candidateProfile.address && { address: data.candidateProfile.address }),
          ...(data.candidateProfile.currentLocation && { currentLocation: data.candidateProfile.currentLocation }),
          ...(data.candidateProfile.expectedSalary && { expectedSalary: data.candidateProfile.expectedSalary }),
          ...(data.candidateProfile.dob && { dob: new Date(data.candidateProfile.dob) }),
          ...(data.candidateProfile.maritalStatus && { maritalStatus: data.candidateProfile.maritalStatus }),
          ...(data.candidateProfile.about && { about: data.candidateProfile.about }),
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
          ...(data.employerProfile.secondaryContactNumber && { secondaryContactNumber: data.employerProfile.secondaryContactNumber })
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
