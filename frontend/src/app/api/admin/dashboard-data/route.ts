import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const totalJobs = await prisma.job.count();
    const activeJobs = await prisma.job.count({ where: { status: 'ACTIVE' } });
    const pendingJobs = await prisma.job.count({ where: { approvalStatus: 'PENDING_APPROVAL' } });
    
    const totalApplications = await prisma.application.count();
    const pendingApplications = await prisma.application.count({ where: { status: 'APPLIED' } });

    const totalCandidates = await prisma.user.count({ where: { role: 'CANDIDATE' } });
    const totalEmployers = await prisma.user.count({ where: { role: 'EMPLOYER' } });

    return NextResponse.json({
      totalJobs, activeJobs, pendingJobs,
      totalApplications, pendingApplications,
      totalCandidates, totalEmployers
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
