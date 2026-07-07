import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    
    const otpRecord = await prisma.otpCode.findFirst({
      where: { email, code: otp, type: 'FORGOT_PASSWORD' },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    if (otpRecord.expiresAt < new Date()) return NextResponse.json({ message: 'OTP has expired.' }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    await prisma.otpCode.deleteMany({ where: { email, type: 'FORGOT_PASSWORD' } });
    return NextResponse.json({ message: 'Password reset successful.' }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
