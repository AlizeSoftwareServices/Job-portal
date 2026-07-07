import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ appId: string, employerId: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const application = await prisma.application.update({
      where: { id: resolvedParams.appId },
      data: { assignedEmployerId: resolvedParams.employerId }
    });
    
    return NextResponse.json(application, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
