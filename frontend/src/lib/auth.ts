import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export const verifyAuth = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Unauthorized' };
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // In Next.js serverless we might not want to always hit the DB for user, but let's replicate NestJS behavior which usually checks the DB if needed.
    // If the token is valid, we can just return the decoded payload.
    return { user: decoded, error: null };
  } catch (err) {
    return { user: null, error: 'Invalid token' };
  }
};
