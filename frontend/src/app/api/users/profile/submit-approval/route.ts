import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'EMPLOYER') {
      return NextResponse.json({ message: 'Only employers can submit profiles for approval.' }, { status: 403 });
    }

    const updatedProfile = await prisma.employerProfile.update({
      where: { userId: user.sub },
      data: {
        approvalStatus: 'PENDING_APPROVAL',
      },
    });

    return NextResponse.json({ message: 'Profile submitted for approval successfully.', profile: updatedProfile });
  } catch (error: any) {
    console.error('Failed to submit profile for approval:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
