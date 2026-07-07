const fs = require('fs');
const path = require('path');

const mkFile = (p, content) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n');
};

mkFile('src/app/api/users/profile/route.ts', `
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
          ...(data.employerProfile.contactPerson && { contactPerson: data.employerProfile.contactPerson }),
          ...(data.employerProfile.secondaryContactNumber && { secondaryContactNumber: data.employerProfile.secondaryContactNumber }),
          ...(data.employerProfile.website && { website: data.employerProfile.website }),
          ...(data.employerProfile.location && { location: data.employerProfile.location }),
          ...(data.employerProfile.description && { description: data.employerProfile.description }),
          ...(data.employerProfile.establishedYear && { establishedYear: data.employerProfile.establishedYear }),
          ...(data.employerProfile.industry && { industry: data.employerProfile.industry }),
          ...(data.employerProfile.teamSize && { teamSize: data.employerProfile.teamSize }),
          ...(data.employerProfile.socialLinks && { socialLinks: data.employerProfile.socialLinks }),
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
`);

mkFile('src/app/api/users/profile/resume/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ message: 'File is required' }, { status: 400 });

    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedMimeTypes.includes(file.type)) return NextResponse.json({ message: 'Only PDF and DOCX files are allowed' }, { status: 400 });
    if (file.size > 100 * 1024) return NextResponse.json({ message: 'Max 100KB' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === 'application/pdf';
    const result = await uploadToCloudinary(buffer, 'job_portal_resumes', isPdf);

    return NextResponse.json({ resumeUrl: result.secure_url }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`);

mkFile('src/app/api/users/profile/avatar/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ message: 'File is required' }, { status: 400 });

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.type)) return NextResponse.json({ message: 'Only JPEG/PNG files are allowed' }, { status: 400 });
    if (file.size > 50 * 1024) return NextResponse.json({ message: 'Max 50KB' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, 'job_portal_avatars', false);

    return NextResponse.json({ avatarUrl: result.secure_url }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`);
