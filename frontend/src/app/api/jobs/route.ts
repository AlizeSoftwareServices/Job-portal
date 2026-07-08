import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MailService } from '@/lib/mail';

function generateRoleCode(title: string): string {
  const cleanTitle = title.replace(/[^a-zA-Z ]/g, '').toUpperCase();
  const words = cleanTitle.split(/\s+/).filter(w => w.length > 0);
  let code = 'JOB';
  if (words.length === 1 && words[0].length >= 3) {
    code = words[0].substring(0, 3);
  } else if (words.length === 2) {
    const firstWord = words[0];
    const secondWord = words[1];
    const consonants = firstWord.substring(1).replace(/[AEIOU]/g, '');
    const middleChar = consonants.length > 0 ? consonants[0] : (firstWord[1] || 'X');
    code = firstWord[0] + middleChar + secondWord[0];
  } else if (words.length >= 3) {
    code = words.slice(0, 3).map(w => w[0]).join('');
  }
  return code.padEnd(3, 'X').substring(0, 3);
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await verifyAuth(req);
    if (error || !user) return NextResponse.json({ message: error }, { status: 401 });

    const data = await req.json();
    const roleCode = generateRoleCode(data.title || 'Job');
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const jobCode = data.jobCode || `${roleCode}${currentYear}${randomNum}`;
    
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'alizesoftwareservicesllp@gmail.com',
          passwordHash: 'dummyhash',
          role: 'ADMIN',
          isVerified: true
        }
      });
    }

    let finalCategoryId = data.categoryId;
    if (finalCategoryId === 'NEW' && data.newCategoryName) {
      let category = await prisma.category.findFirst({ where: { name: data.newCategoryName.trim() } });
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: data.newCategoryName.trim(),
            imageUrl: null
          }
        });
      }
      finalCategoryId = category.id;
    }

    const job = await prisma.job.create({
      data: {
        title: data.title,
        locationCity: data.locationCity,
        locationState: data.locationState,
        experienceLevel: data.experienceLevel || 'Entry Level',
        workMode: data.workMode || 'Remote',
        jobType: data.jobType || 'Full Time',
        description: data.description,
        requirements: data.requirements || '',
        jobCode,
        categoryId: finalCategoryId,
        employerId: user.sub,
        approvalStatus: 'PENDING_APPROVAL', 
        salary: data.salary,
        salaryType: data.salaryType || 'Month',
        salaryVisible: data.salaryVisible !== undefined ? data.salaryVisible : true,
        vacancyCount: Number(data.vacancyCount) || 1,
        shiftTimings: data.shiftTimings,
        benefits: data.benefits,
        generalComments: data.generalComments,
        salaryMin: data.salaryMin ? parseInt(data.salaryMin, 10) : null,
        salaryMax: data.salaryMax ? parseInt(data.salaryMax, 10) : null
      }
    });

    try {
      await MailService.sendAdminNewJobRequestEmail(
        admin.email, 
        data.title, 
        user.email
      );
    } catch (e) {
      console.error('Failed to send admin notification for new job post', e);
    }

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const employerId = searchParams.get('employerId');

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (employerId) {
      where.employerId = employerId;
    } else {
      where.status = 'ACTIVE';
      where.approvalStatus = 'APPROVED';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { locationCity: { contains: search, mode: 'insensitive' } },
        { locationState: { contains: search, mode: 'insensitive' } }
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        category: true,
        employer: {
          include: { employerProfile: true }
        },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = jobs.map((job: any) => ({
      ...job,
      applicationsCount: job._count.applications
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
