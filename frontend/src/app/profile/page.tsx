import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  const cookieStore = cookies();
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      candidateProfile: true,
      savedJobs: {
        include: {
          job: {
            include: {
              employer: { include: { employerProfile: true } },
              category: true
            }
          }
        }
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const applications = await prisma.application.findMany({
    where: { candidateId: userId },
    include: {
      job: {
        include: {
          employer: { include: { employerProfile: true } },
          category: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Format data for client component
  const profileData = {
    ...user,
    savedJobs: user.savedJobs.map(sj => sj.job)
  };

  return <ProfileClient initialProfile={profileData} initialApplications={applications} />;
}
