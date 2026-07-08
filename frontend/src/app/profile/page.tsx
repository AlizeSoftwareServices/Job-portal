import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('skyo_token')?.value;

  if (!token) {
    redirect('/login');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (e) {
    redirect('/login');
  }

  const userId = decoded.sub;

  const [user, applications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: {
          include: {
            skills: true,
            experiences: true,
            educations: true,
            projects: true,
            certifications: true
          }
        },
        savedJobs: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
                jobCode: true,
                locationCity: true,
                locationState: true,
                jobType: true,
                workMode: true,
                fieldVisibility: true,
                category: { select: { name: true } }
              }
            }
          }
        },
      },
    }) as any,
    prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            jobCode: true,
            locationCity: true,
            locationState: true,
            jobType: true,
            workMode: true,
            fieldVisibility: true,
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { appliedAt: 'desc' }
    })
  ]);

  if (!user) {
    redirect('/login');
  }

  // Format data for client component
  const profileData = {
    ...user,
    savedJobs: user.savedJobs || []
  };

  return <ProfileClient initialProfile={profileData} initialApplications={applications} />;
}
