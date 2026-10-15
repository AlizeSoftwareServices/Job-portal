import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 5, 10 * 60 * 1000); // 5 submissions per 10 mins
    if (!rateLimit.success) {
      return NextResponse.json({ message: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : 'General Enquiry',
        message: message.trim(),
        status: 'PENDING'
      }
    });

    return NextResponse.json(
      { success: true, message: 'Your message has been sent successfully. We will contact you soon.', enquiry },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting enquiry:', error);
    return NextResponse.json(
      { message: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
