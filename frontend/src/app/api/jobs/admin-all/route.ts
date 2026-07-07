import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const jobs = await prisma.job.findMany({
      include: {
        category: true,
        employer: {
          include: { employerProfile: true }
        },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = jobs.map((job: any) => ({
      ...job,
      applicationsCount: job._count.applications
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
