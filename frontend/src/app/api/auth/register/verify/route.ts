import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MailService } from '@/lib/mail';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { firstName, lastName, countryCode, phone, email, password, otp, role, companyName, secondaryContactNumber } = data;

    const otpRecord = await prisma.otpCode.findFirst({
      where: { email, code: otp, type: 'REGISTER' },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    if (otpRecord.expiresAt < new Date()) return NextResponse.json({ message: 'OTP has expired.' }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ message: 'User already exists.' }, { status: 400 });

    const userRole = role === 'EMPLOYER' ? 'EMPLOYER' : 'CANDIDATE';
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        countryCode,
        phone,
        isVerified: true,
        role: userRole,
        ...(userRole === 'CANDIDATE' ? {
          candidateProfile: {
            create: {
              fullName: `${firstName} ${lastName || ''}`.trim(),
              phone: `${countryCode} ${phone}`,
            }
          }
        } : {
          employerProfile: {
            create: {
              companyName: companyName || `${firstName} Company`,
              contactPerson: `${firstName} ${lastName || ''}`.trim(),
              secondaryContactNumber: secondaryContactNumber || null,
            }
          }
        })
      }
    });

    await prisma.otpCode.deleteMany({ where: { email, type: 'REGISTER' } });

    if (userRole === 'EMPLOYER') {
      try {
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (admin) {
          await MailService.sendAdminNewEmployerEmail(
            admin.email, 
            companyName || `${firstName} Company`, 
            `${firstName} ${lastName || ''}`.trim(), 
            email
          );
        }
      } catch (e) {
        console.error('Failed to send admin notification for new employer', e);
      }
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({ 
      message: 'Registration successful', 
      token, 
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role } 
    }, { status: 200 });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
