import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MailService } from '@/lib/mail';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

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
