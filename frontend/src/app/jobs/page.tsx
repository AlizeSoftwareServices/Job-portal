import Link from 'next/link';
import { Suspense } from 'react';
import JobsClient from './JobsClient';
import AuthButtons from '../../components/AuthButtons';
import ProfileLink from '../../components/ProfileLink';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

import { prisma } from '@/lib/prisma';

async function getJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: { 
        approvalStatus: 'APPROVED',
        OR: [
          { status: 'ACTIVE' },
          { 
            status: 'COMPLETED',
            updatedAt: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
          }
        ]
      },
      include: {
        category: true,
        employer: { include: { employerProfile: true } },
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return jobs.map((job: any) => ({
      ...job,
      applicationsCount: job._count.applications
    }));
  } catch (err) {
    return [];
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { jobs: { where: { 
          approvalStatus: 'APPROVED',
          OR: [
            { status: 'ACTIVE' },
            { 
              status: 'COMPLETED',
              updatedAt: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
            }
          ]
        } } } }
      }
    });
    return categories.map((cat: any) => ({
      ...cat,
      jobCount: cat._count.jobs
    }));
  } catch (err) {
    return [];
  }
}

export default async function JobsListing({ searchParams }: { searchParams: Promise<{ q?: string, loc?: string, category?: string }> }) {
  const params = await searchParams;
  const q = params?.q || '';
  const loc = params?.loc || '';
  const category = params?.category || '';
  const jobs = await getJobs();
  const categories = await getCategories();
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      {/* Navigation */}
      <Navbar />

      <Suspense fallback={<div className="p-10 text-center animate-pulse">Loading jobs...</div>}>
        <JobsClient initialJobs={jobs} initialCategories={categories} initialQuery={q} initialLoc={loc} initialCategory={category} />
      </Suspense>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
