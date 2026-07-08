import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MailService } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const data = await req.json();
    
    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: user.sub,
        jobId: data.jobId
      }
    });

    if (existingApplication) {
      return NextResponse.json({ message: 'You have already applied for this job' }, { status: 400 });
    }

    // Await strictly the DB insert
    const application = await prisma.application.create({
      data: {
        jobId: data.jobId,
        candidateId: user.sub,
        resumeUrl: data.resumeUrl || null,
      }
    });

    // Fetch candidate and job in parallel. Include employer email directly in job query.
    const [candidate, job] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.sub } }),
      prisma.job.findUnique({
        where: { id: data.jobId },
        include: { employer: { select: { email: true } } }
      })
    ]);

    if (candidate && job) {
      const refId = `REF-${application.id.substring(0, 8).toUpperCase()}`;
      
      // Save refId to database
      await prisma.application.update({
        where: { id: application.id },
        data: { referenceNumber: refId }
      });
      
      
      const emailTasks: Promise<any>[] = [];

      // Email to Candidate
      emailTasks.push(
        MailService.sendApplicationConfirmation(candidate.email, candidate.firstName || 'Candidate', job.title, refId)
      );
      
      // Email to Employer or Admin based on routeType
      if (job.routeType === 'DIRECT' && job.employer?.email) {
        emailTasks.push(
          MailService.sendAdminNewApplicationEmail(job.employer.email, candidate, job.title, refId)
        );
      } else if (job.routeType === 'SKYO') {
        const adminEmail = process.env.GMAIL_USER;
        if (adminEmail) {
          emailTasks.push(
            MailService.sendAdminNewApplicationEmail(adminEmail, candidate, job.title, refId)
          );
        }
      }

      // Execute safely without failing the request
      Promise.allSettled(emailTasks).then(results => {
        results.forEach((result, idx) => {
          if (result.status === 'rejected') {
            console.error(`Email task ${idx} failed for application ${refId}:`, result.reason);
          }
        });
      });
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create application:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '16', 10), 100);
    const skip = (Math.max(page, 1) - 1) * limit;

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Candidate selection avoiding sensitive data
    const candidateSelect = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      countryCode: true,
      candidateProfile: {
        select: {
          fullName: true,
          avatarUrl: true,
        }
      }
    };

    let baseWhere: any = {};
    if (user.role === 'EMPLOYER') {
      baseWhere = {
        OR: [
          { job: { employerId: user.sub } },
          { assignedEmployerId: user.sub }
        ]
      };
    } else if (user.role === 'CANDIDATE') {
      baseWhere = { candidateId: user.sub };
    }

    const where = {
      ...baseWhere,
      ...(status && !status.toUpperCase().startsWith('ALL') && { status: status as any }),
      ...(search && {
        OR: [
          { candidate: { firstName: { contains: search, mode: 'insensitive' } } },
          { candidate: { lastName: { contains: search, mode: 'insensitive' } } },
          { candidate: { email: { contains: search, mode: 'insensitive' } } },
          { job: { title: { contains: search, mode: 'insensitive' } } },
        ]
      })
    };

    const [totalItems, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        include: {
          job: { include: { category: true } },
          candidate: { select: candidateSelect }
        },
        orderBy: { appliedAt: 'desc' }
      })
    ]);

    return NextResponse.json({
      items: applications,
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
