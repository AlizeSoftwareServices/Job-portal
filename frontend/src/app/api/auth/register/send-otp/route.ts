import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MailService } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiresAt = new Date(Date.now() + 3 * 60000); // 3 minutes

    await prisma.otpCode.create({
      data: { email, code, type: 'REGISTER', expiresAt }
    });

    await MailService.sendRegistrationOtpEmail(email, code);

    return NextResponse.json({ message: 'OTP sent to your email.' }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
