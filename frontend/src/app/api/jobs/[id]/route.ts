import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export const revalidate = 60;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const job = await prisma.job.findUnique({
      where: { id: resolvedParams.id },
      include: {
        category: true,
        employer: {
          include: { employerProfile: true }
        },
        _count: { select: { applications: true } }
      }
    });

    if (!job) return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    return NextResponse.json({ ...job, applicationsCount: job._count.applications }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const existingJob = await prisma.job.findUnique({ where: { id: resolvedParams.id } });
    if (!existingJob) return NextResponse.json({ message: 'Job not found' }, { status: 404 });

    const isAdmin = user.role === 'ADMIN';
    const isOwner = existingJob.employerId === user.sub;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: 'Forbidden: You do not have permission to modify this job' }, { status: 403 });
    }

    const data = await req.json();
    const { newCategoryName, ...updateData } = data;

    // Prevent non-admin users from escalating privileges or altering approval status
    if (!isAdmin) {
      delete updateData.approvalStatus;
      delete updateData.createdByAdminId;
    }

    const job = await prisma.job.update({
      where: { id: resolvedParams.id },
      data: updateData
    });
    return NextResponse.json(job, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const existingJob = await prisma.job.findUnique({ where: { id: resolvedParams.id } });
    if (!existingJob) return NextResponse.json({ message: 'Job not found' }, { status: 404 });

    const isAdmin = user.role === 'ADMIN';
    const isOwner = existingJob.employerId === user.sub;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: 'Forbidden: You do not have permission to delete this job' }, { status: 403 });
    }

    await prisma.job.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
