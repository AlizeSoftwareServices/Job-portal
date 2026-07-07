const fs = require('fs');
const path = require('path');

const mkFile = (p, content) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content.trim() + '\n');
};

mkFile('src/app/api/applications/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MailService } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const data = await req.json();
    
    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: user.sub,
        jobId: data.jobId
      }
    });

    if (existingApplication) {
      return NextResponse.json({ message: 'You have already applied for this job' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        jobId: data.jobId,
        candidateId: user.sub,
        resumeUrl: data.resumeUrl || null,
        coverLetter: data.coverLetter || null,
      }
    });

    const candidate = await prisma.user.findUnique({ where: { id: user.sub } });
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    const employer = await prisma.user.findUnique({ where: { id: job?.employerId } });

    if (candidate && job) {
      const refId = \`REF-\${application.id.substring(0, 8).toUpperCase()}\`;
      MailService.sendApplicationConfirmation(candidate.email, candidate.firstName, job.title, refId).catch(e => console.error(e));
      if (employer) {
        MailService.sendEmployerNewApplication(employer.email, job.title, \`\${candidate.firstName} \${candidate.lastName || ''}\`.trim(), candidate.email).catch(e => console.error(e));
      }
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`);

mkFile('src/app/api/applications/job/[id]/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const applications = await prisma.application.findMany({
      where: { jobId: params.id },
      include: {
        candidate: {
          include: { candidateProfile: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`);

mkFile('src/app/api/applications/[id]/status/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MailService } from '@/lib/mail';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const { status } = await req.json();
    const application = await prisma.application.update({
      where: { id: params.id },
      data: { status },
      include: { job: true, candidate: true }
    });

    if (status === 'REVIEWED' || status === 'SHORTLISTED' || status === 'REJECTED' || status === 'HIRED') {
      MailService.sendApplicationStatusUpdate(
        application.candidate.email,
        application.candidate.firstName,
        application.job.title,
        status
      ).catch(e => console.error(e));
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`);

mkFile('src/app/api/applications/user/me/route.ts', `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const applications = await prisma.application.findMany({
      where: { candidateId: user.sub },
      include: {
        job: {
          include: {
            employer: { include: { employerProfile: true } }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
`);
