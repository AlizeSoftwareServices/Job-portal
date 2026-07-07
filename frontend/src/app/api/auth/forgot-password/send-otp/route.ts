import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MailService } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60000);

    await prisma.otpCode.create({
      data: { email, code, type: 'FORGOT_PASSWORD', expiresAt }
    });

    await MailService.sendForgotPasswordOtpEmail(email, code);
    return NextResponse.json({ message: 'OTP sent to your email.' }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
