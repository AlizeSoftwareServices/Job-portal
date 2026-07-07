import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MailService } from '@/lib/mail';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { subject, message } = body;

    const application = await prisma.application.findUnique({
      where: { id: resolvedParams.id },
      include: { candidate: true }
    });

    if (!application || !application.candidate) {
      return NextResponse.json({ message: 'Application or Candidate not found' }, { status: 404 });
    }

    await MailService.sendCustomEmail(application.candidate.email, subject, message);
    
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
