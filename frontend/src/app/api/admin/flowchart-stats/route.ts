import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const categories = await prisma.category.findMany({ select: { id: true, name: true, imageUrl: true } });
    
    // Group jobs by category and count them
    const jobsGrouped = await prisma.job.groupBy({
      by: ['categoryId', 'status'],
      _count: {
        id: true,
      }
    });

    // Group applications by jobId
    const applicationsGrouped = await prisma.application.groupBy({
      by: ['jobId'],
      _count: {
        id: true,
      }
    });
    
    // Fetch basic job info to link application counts to job titles
    const jobsList = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        categoryId: true,
      }
    });

    const categoriesMap = new Map();
    for (const cat of categories) {
      categoriesMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        jobs: []
      });
    }

    const applicationsMap = new Map();
    for (const app of applicationsGrouped) {
      applicationsMap.set(app.jobId, app._count.id);
    }

    for (const job of jobsList) {
      if (job.categoryId && categoriesMap.has(job.categoryId)) {
        categoriesMap.get(job.categoryId).jobs.push({
          id: job.id,
          title: job.title,
          status: job.status,
          appsCount: applicationsMap.get(job.id) || 0
        });
      }
    }

    // Format for RelationalFlowChart
    const categoryDetailedList = Array.from(categoriesMap.values()).map(cat => ({
      name: cat.name,
      totalApps: cat.jobs.reduce((sum: number, j: any) => sum + j.appsCount, 0),
      jobs: cat.jobs
    })).sort((a, b) => b.jobs.length - a.jobs.length);

    return NextResponse.json(categoryDetailedList, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
