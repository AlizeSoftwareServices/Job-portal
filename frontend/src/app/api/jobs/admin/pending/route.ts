import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const jobs = await prisma.job.findMany({
      where: { approvalStatus: 'PENDING_APPROVAL' },
      include: {
        category: true,
        employer: {
          include: { employerProfile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(jobs, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
