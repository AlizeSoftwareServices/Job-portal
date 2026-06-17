import Link from 'next/link';
import JobsClient from './JobsClient';
import AuthButtons from '../../components/AuthButtons';
import ProfileLink from '../../components/ProfileLink';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

async function getJobs() {
  try {
    const res = await fetch('http://localhost:3000/jobs', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    return [];
  }
}

async function getCategories() {
  try {
    const res = await fetch('http://localhost:3000/categories', { cache: 'no-store' });
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

      <JobsClient initialJobs={jobs} initialCategories={categories} initialQuery={q} initialLoc={loc} initialCategory={category} />
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
