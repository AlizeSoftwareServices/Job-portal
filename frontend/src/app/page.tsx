import Link from 'next/link';
import { Suspense } from 'react';
import { Search, MapPin, Briefcase, ChevronRight, Building, Clock, Building2 } from 'lucide-react';
import JobCard from '../components/JobCard';
import ShareButton from '../components/ShareButton';
import GlobalSearchBar from '../components/GlobalSearchBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const revalidate = 60; // Cache for 60 seconds (ISR)

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

import { prisma } from '@/lib/prisma';

async function getFeaturedJobs() {
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
      orderBy: { createdAt: 'desc' },
      take: 6
    });
    return jobs.map((job: any) => ({
      ...job,
      applicationsCount: job._count.applications
    }));
  } catch (err) {
    console.error('Failed to fetch jobs:', err);
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
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

export default async function Home() {
  const featuredJobs = await getFeaturedJobs();
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-20 md:pb-28 px-6 bg-sky-800">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Office Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-sky-800/65 backdrop-blur-[1px]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-4 md:mb-6 leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Next Great</span> Opportunity.
          </h1>
          <p className="text-xl md:text-2xl text-sky-50 mb-12 max-w-3xl mx-auto font-light">
            Connect with top companies and accelerate your career. Our intelligent matching system finds the perfect role for your skills.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="h-16 w-full bg-white/20 rounded-2xl animate-pulse"></div>}>
              <GlobalSearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Featured Sectors */}
      <section className="py-20 px-6 bg-white border-y border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Explore Top Categories</h2>
            <p className="text-zinc-600">Find opportunities across various industries tailored to your skills.</p>
          </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
          {categories.filter((category: any) => category.jobCount > 0).slice(0, 8).map((category: any, index: number) => (
            <Link href={`/jobs?category=${encodeURIComponent(category.name)}`} key={category.id || index} className="bg-white border border-zinc-200 rounded-xl hover:shadow-lg hover:border-sky-300 transition-all group overflow-hidden flex flex-col h-32 md:h-48 relative">
              {category.imageUrl ? (
                <div className="absolute inset-0 w-full h-full">
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10"></div>
                </div>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-zinc-100"></div>
              )}
              
              <div className="relative z-10 flex flex-col justify-between h-full p-3 md:p-6 text-white">
                <div>
                  <h3 className="text-sm md:text-lg font-bold text-white drop-shadow-md">{category.name}</h3>
                  <span className="text-xs md:text-sm font-medium text-sky-200 bg-black/30 px-2 py-0.5 rounded-full inline-block mt-1 backdrop-blur-sm">
                    {category.jobCount || 0} Jobs
                  </span>
                </div>
                
                <div className="flex items-center text-sm font-bold text-white mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 drop-shadow-md">
                  Explore <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/jobs" className="inline-flex items-center bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold px-8 py-3 rounded-full transition-all border border-sky-200 hover:shadow-sm">
            Explore All Categories <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </div>

        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 px-6 bg-gradient-to-br from-sky-800 via-sky-950 to-cyan-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Featured Opportunities</h2>
          <p className="text-sky-200">Hand-picked jobs from top companies actively hiring.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto">
          {featuredJobs.length === 0 ? (
            <p className="col-span-3 text-center text-zinc-500 bg-zinc-50 p-8 rounded-2xl border border-zinc-200">No featured jobs available right now.</p>
          ) : (
            featuredJobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </div>
        <div className="text-center mt-16 relative z-10">
          <Link href="/jobs" className="inline-flex items-center bg-sky-800 text-white hover:bg-sky-700 font-bold px-8 py-4 rounded-full transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_25px_rgba(37,99,235,0.4)] hover:-translate-y-1">
            Explore All Opportunities <ChevronRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Register with Us Section */}
      <section className="py-24 px-6 bg-[#f3f6fc]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row relative min-h-[600px] p-10 md:p-16">
            
            {/* Left Content */}
            <div className="md:w-1/2 flex flex-col justify-center relative z-20 md:pr-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-0.5 bg-sky-700"></div>
                <span className="text-amber-500 font-bold tracking-wide text-lg">Join Our Network</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-[1.1] text-zinc-900 font-serif">
                Upload Your Resume <br/>
                <span className="text-amber-500 font-sans tracking-tight">Find Your Job</span>
              </h2>
              <p className="text-zinc-600 mb-8 md:mb-10 leading-relaxed text-base md:text-lg max-w-md">
                Do you want to get started, but have not found the ideal job vacancy yet? Register with us and let the perfect opportunity find you.
              </p>
              <div>
                <Link href="/register-cv" className="inline-flex items-center justify-center bg-sky-800 hover:bg-sky-800 text-white font-medium px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Submit Your CV
                </Link>
              </div>
            </div>

            {/* Right Images Composition */}
            <div className="w-full md:w-1/2 relative mt-8 md:mt-0 flex justify-center items-center z-10 md:scale-100 origin-center md:origin-right">
              
              {/* Decorative Shapes */}
              <div className="hidden md:block absolute top-[10%] left-[10%] w-48 h-48 bg-[#FCD34D] rounded-full mix-blend-multiply opacity-90 z-0"></div>
              <div className="hidden md:block absolute top-[5%] right-[5%] w-64 h-80 bg-[#FDBA74] rounded-full mix-blend-multiply opacity-80 z-0 transform rotate-12"></div>
              <div className="hidden md:block absolute bottom-[5%] right-[10%] w-40 h-40 bg-[#93C5FD] rounded-full mix-blend-multiply opacity-90 z-0"></div>

              {/* Sparkles */}
              <svg className="hidden md:block absolute top-[5%] left-[45%] w-10 h-10 text-sky-200 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z"/></svg>
              <svg className="hidden md:block absolute bottom-[10%] right-[35%] w-8 h-8 text-sky-200 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z"/></svg>
              
              {/* Left Pill Image */}
              <div className="hidden md:block absolute left-[5%] md:left-[10%] top-[25%] w-40 h-64 rounded-[4rem] border-[6px] border-white shadow-xl overflow-hidden z-20">
                <img src="/images/user-uploaded-cv.jpg" alt="Student" className="w-full h-full object-cover" />
              </div>
              
              {/* Middle Tall Pill Image */}
              <div className="relative w-full max-w-[250px] md:w-48 h-64 md:h-96 rounded-[3rem] md:rounded-[5rem] border-[6px] border-white shadow-2xl overflow-hidden z-30 mx-auto">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Working" className="w-full h-full object-cover" />
              </div>
              
              {/* Right Pill Image */}
              <div className="hidden md:block absolute right-[5%] md:right-[0%] top-[20%] w-40 h-64 rounded-[4rem] border-[6px] border-white shadow-xl overflow-hidden z-10">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Writing" className="w-full h-full object-cover" />
              </div>

              {/* Small Profile Circles */}
              <div className="hidden md:block absolute left-[8%] bottom-[20%] w-16 h-16 rounded-full border-4 border-[#10B981] bg-white overflow-hidden z-40 shadow-lg">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-full h-full object-cover" />
              </div>
              
              <div className="hidden md:block absolute right-[5%] top-[12%] w-16 h-16 rounded-full border-4 border-[#34D399] bg-white overflow-hidden z-40 shadow-lg">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-full h-full object-cover" />
              </div>

            </div>
          </div>
        </div>
      </section>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
