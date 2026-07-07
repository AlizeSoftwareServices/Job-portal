import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const employers = await prisma.user.findMany({
      where: { role: 'EMPLOYER' },
      include: {
        employerProfile: true,
        jobsRequested: {
          select: { id: true, title: true, status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employers, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
