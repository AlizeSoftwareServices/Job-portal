import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export const verifyAuth = async (req: NextRequest) => {
  try {
    let token: string | null = null;
    
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.cookies.get('skyo_token')?.value || req.cookies.get('skyo_admin_token')?.value || null;
    }

    if (!token) {
      return { user: null, error: 'Unauthorized' };
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // In Next.js serverless we might not want to always hit the DB for user, but let's replicate NestJS behavior which usually checks the DB if needed.
    // If the token is valid, we can just return the decoded payload.
    return { user: decoded, error: null };
  } catch (err) {
    return { user: null, error: 'Invalid token' };
  }
};
