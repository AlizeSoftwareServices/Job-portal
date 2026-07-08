import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '16', 10), 100);
    const skip = (Math.max(page, 1) - 1) * limit;

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const approvalStatus = searchParams.get('approvalStatus') || '';

    const where: Prisma.JobWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { jobCode: { contains: search, mode: 'insensitive' } },
        ]
      }),
      ...(status && !status.toUpperCase().startsWith('ALL') && { status: status as any }),
      ...(approvalStatus && !approvalStatus.toUpperCase().startsWith('ALL') && { approvalStatus: approvalStatus as any }),
    };

    const [totalItems, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          employer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              employerProfile: true
            }
          },
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const result = jobs.map((job: any) => ({
      ...job,
      applicationsCount: job._count.applications
    }));

    return NextResponse.json({
      items: result,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
