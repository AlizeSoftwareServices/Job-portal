import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const category = await prisma.category.findUnique({ where: { id: resolvedParams.id } });
    if (!category) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
    return NextResponse.json(category, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const resolvedParams = await params;
    const data = await req.json();
    const category = await prisma.category.update({
      where: { id: resolvedParams.id },
      data,
    });
    return NextResponse.json(category, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const resolvedParams = await params;
    await prisma.category.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
