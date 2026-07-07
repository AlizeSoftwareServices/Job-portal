import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import ApplyClient from './ApplyClient';

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = await params;
  const jobId = unwrappedParams.id;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('skyo_token')?.value;

  if (!token) {
    redirect(`/login?redirect=/jobs/${jobId}/apply`);
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
  } catch (e) {
    redirect(`/login?redirect=/jobs/${jobId}/apply`);
  }

  const userId = decoded.sub;

  const [job, user] = await Promise.all([
    prisma.job.findUnique({
      where: { id: jobId }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: true
      }
    })
  ]);

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Job not found.</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <ApplyClient 
      job={job} 
      profileData={user} 
      candidateProfile={user.candidateProfile} 
    />
  );
}
