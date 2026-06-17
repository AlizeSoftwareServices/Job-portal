import Link from 'next/link';
import { Suspense } from 'react';
import JobsClient from './JobsClient';
import AuthButtons from '../../components/AuthButtons';
import ProfileLink from '../../components/ProfileLink';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

export const dynamic = 'force-dynamic';

async function getJobs() {
  try {
    const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/jobs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

export default async function JobsListing({ searchParams }: { searchParams: { q?: string, loc?: string, category?: string } }) {
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
