import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const job = await prisma.job.findUnique({
      where: { id: resolvedParams.id },
      select: { id: true, employerId: true }
    });

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'ADMIN';
    const isJobEmployer = user.role === 'EMPLOYER' && job.employerId === user.sub;

    if (!isAdmin && !isJobEmployer) {
      return NextResponse.json({ message: 'Forbidden: You do not have permission to view applicants for this job' }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      where: { jobId: resolvedParams.id },
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

export const dynamic = 'force-dynamic';
