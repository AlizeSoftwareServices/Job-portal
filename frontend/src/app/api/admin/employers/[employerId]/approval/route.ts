import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ employerId: string }> }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { employerId } = await params;
    const { action } = await req.json();

    if (action !== 'ONBOARD' && action !== 'REJECT') {
      return NextResponse.json({ message: 'Invalid action. Must be ONBOARD or REJECT.' }, { status: 400 });
    }

    const newStatus = action === 'ONBOARD' ? 'APPROVED' : 'REJECTED';

    const updatedProfile = await prisma.employerProfile.update({
      where: { userId: employerId },
      data: { approvalStatus: newStatus }
    });

    return NextResponse.json({ message: `Employer ${action === 'ONBOARD' ? 'approved' : 'rejected'} successfully.`, profile: updatedProfile });
  } catch (error: any) {
    console.error('Failed to update employer approval status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
