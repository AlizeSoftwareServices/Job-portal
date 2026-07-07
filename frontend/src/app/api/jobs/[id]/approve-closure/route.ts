import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const job = await prisma.job.update({
      where: { id: resolvedParams.id },
      data: { status: 'CLOSED', approvalStatus: 'APPROVED' }
    });
    
    return NextResponse.json(job, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
