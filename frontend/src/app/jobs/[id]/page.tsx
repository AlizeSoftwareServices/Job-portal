import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import JobDetailsClient from './JobDetailsClient';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Cache this page using ISR

export default async function JobDetailsServerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;
  
  let job = null;
  try {
    job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true,
        employer: {
          include: { employerProfile: true }
        },
        _count: { select: { applications: true } }
      }
    });

    if (job) {
      // @ts-ignore - flatten applicationsCount like the API does
      job.applicationsCount = job._count.applications;
    }
  } catch (err) {
    console.error("Error fetching job in Server Component:", err);
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      <Navbar />

      <main className="max-w-4xl w-full mx-auto px-6 mb-16">
        <div className="pt-8 pb-4">
          <Link href="/jobs" className="inline-flex items-center text-sky-800 hover:text-sky-800 font-bold transition-colors w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
          </Link>
        </div>
        
        <JobDetailsClient job={job} />
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
