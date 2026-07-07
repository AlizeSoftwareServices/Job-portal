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
        { sub: 'admin', email: 'admin@skyoconsultancy.com', role: 'ADMIN' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );
      return NextResponse.json({ token }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
