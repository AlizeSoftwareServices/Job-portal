import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const applications = await prisma.application.findMany({
      where: { candidateId: user.sub },
      include: {
        job: {
          include: {
            employer: { include: { employerProfile: true } }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return NextResponse.json(applications, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
