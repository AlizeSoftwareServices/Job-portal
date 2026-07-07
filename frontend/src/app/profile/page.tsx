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

  const user: any = await prisma.user.findUnique({
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
    orderBy: { appliedAt: 'desc' }
  });

  // Format data for client component
  const profileData = {
    ...user,
    savedJobs: user.savedJobs || []
  };

  return <ProfileClient initialProfile={profileData} initialApplications={applications} />;
}
