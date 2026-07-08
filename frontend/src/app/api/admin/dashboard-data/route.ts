import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const [
      totalJobs,
      activeJobs,
      pendingJobs,
      totalApplications,
      pendingApplications,
      totalCandidates,
      totalEmployers
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.job.count({ where: { approvalStatus: 'PENDING_APPROVAL' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'APPLIED' } }),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } })
    ]);

    return NextResponse.json({
      totalJobs, activeJobs, pendingJobs,
      totalApplications, pendingApplications,
      totalCandidates, totalEmployers
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
