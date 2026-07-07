import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 5, 10 * 60 * 1000); // 5 attempts per 10 mins
    if (!rateLimit.success) {
      return NextResponse.json({ message: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const data = await req.json();
    const { username, password } = data;

    // Hardcoded admin credentials for now
    if (username === 'Skyoadmin' && password === 'SkyoMPC') {
      const token = jwt.sign(
        { sub: 'admin', email: 'alizesoftwareservicesllp@gmail.com', role: 'ADMIN' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      const response = NextResponse.json({ token }, { status: 200 });
      response.cookies.set({
        name: 'skyo_admin_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 days
      });
      return response;
    } else {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
