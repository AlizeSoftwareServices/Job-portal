import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MailService } from '@/lib/mail';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const existingApp = await prisma.application.findUnique({
      where: { id: resolvedParams.id },
      include: { job: { select: { employerId: true } } }
    });

    if (!existingApp) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN';
    const isAssignedEmployer = user.role === 'EMPLOYER' && (existingApp.assignedEmployerId === user.sub || existingApp.job?.employerId === user.sub);

    if (!isAdmin && !isAssignedEmployer) {
      return NextResponse.json({ message: 'Forbidden: You do not have permission to update this application status' }, { status: 403 });
    }

    const { status } = await req.json();
    const application = await prisma.application.update({
      where: { id: resolvedParams.id },
      data: { status },
      include: { job: true, candidate: true }
    });

    if ((status === 'REVIEWED' || status === 'SHORTLISTED' || status === 'REJECTED' || status === 'HIRED') && application.candidate && application.job) {
      await MailService.sendStatusUpdateEmail(
        application.candidate.email,
        application.candidate.firstName || 'Candidate',
        application.job.title,
        status,
        application.referenceNumber || 'N/A'
      );
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
