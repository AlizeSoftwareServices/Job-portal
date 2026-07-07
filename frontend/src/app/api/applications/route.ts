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
      }
    });

    const candidate = await prisma.user.findUnique({ where: { id: user.sub } });
    const job = await prisma.job.findUnique({ where: { id: data.jobId } });
    const employer = job?.employerId ? await prisma.user.findUnique({ where: { id: job.employerId } }) : null;

    if (candidate && job) {
      const refId = `REF-${application.id.substring(0, 8).toUpperCase()}`;
      await MailService.sendApplicationConfirmation(candidate.email, candidate.firstName || 'Candidate', job.title, refId);
      if (employer) {
        await MailService.sendAdminNewApplicationEmail(employer.email, candidate, job.title, refId);
      }
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    let applications;
    if (user.role === 'ADMIN') {
      applications = await prisma.application.findMany({ include: { job: { include: { category: true } }, candidate: true }, orderBy: { appliedAt: 'desc' } });
    } else if (user.role === 'EMPLOYER') {
      applications = await prisma.application.findMany({ where: { job: { employerId: user.sub } }, include: { job: { include: { category: true } }, candidate: true }, orderBy: { appliedAt: 'desc' } });
    } else {
      applications = await prisma.application.findMany({ where: { candidateId: user.sub }, include: { job: { include: { category: true } }, candidate: true }, orderBy: { appliedAt: 'desc' } });
    }
    return NextResponse.json(applications, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
