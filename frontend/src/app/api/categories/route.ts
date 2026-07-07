import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { jobs: { where: { status: 'ACTIVE' } } }
        }
      }
    });

    const result = categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      imageUrl: cat.imageUrl,
      jobCount: cat._count.jobs
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const category = await prisma.category.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl || null
      }
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
