import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user || user.role !== 'ADMIN') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { employerId, filters } = body;
    if (!employerId) {
      return NextResponse.json({ message: 'Employer ID is required' }, { status: 400 });
    }

    const { category, job, location, status, search } = filters || {};

    let applicationWhere: any = {};
    if (category && category !== 'All') {
      applicationWhere.job = { ...applicationWhere.job, category: { name: category } };
    }
    if (job && job !== 'All') {
      applicationWhere.job = { ...applicationWhere.job, title: job };
    }
    if (location && location !== 'All') {
      const [city, state] = location.split(', ');
      applicationWhere.job = { ...applicationWhere.job, locationCity: city, locationState: state };
    }
    if (status && status !== 'All') {
      applicationWhere.status = status as any;
    }

    // Apply search filters
    const searchFilter = search ? {
      OR: [
        { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
        { candidate: { email: { contains: search, mode: 'insensitive' } } },
        { job: { title: { contains: search, mode: 'insensitive' } } },
      ]
    } : {};

    const where = {
      ...applicationWhere,
      ...searchFilter,
    };

    const updateResult = await prisma.application.updateMany({
      where,
      data: {
        assignedEmployerId: employerId,
        isPassedToEmployer: true
      }
    });

    return NextResponse.json({ message: 'Applicants successfully passed to employer', count: updateResult.count }, { status: 200 });
  } catch (error: any) {
    console.error('Bulk assign employer error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
