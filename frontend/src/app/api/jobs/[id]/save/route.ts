import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const unwrappedParams = await params;
    const jobId = unwrappedParams.id;

    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.sub,
          jobId,
        },
      },
    });

    return NextResponse.json({ isSaved: !!savedJob }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const unwrappedParams = await params;
    const jobId = unwrappedParams.id;
    const userId = user.sub;

    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existing) {
      await prisma.savedJob.delete({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });
      return NextResponse.json({ message: 'Job removed from saved jobs', isSaved: false }, { status: 200 });
    } else {
      await prisma.savedJob.create({
        data: {
          userId,
          jobId,
        },
      });
      return NextResponse.json({ message: 'Job saved successfully', isSaved: true }, { status: 201 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
