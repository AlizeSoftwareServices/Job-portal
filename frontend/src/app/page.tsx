import Link from 'next/link';
import { Suspense } from 'react';
import { 
  Search, MapPin, Briefcase, ChevronRight, Building, Clock, Building2, 
  Users, Target, Layers, FileSpreadsheet, Scale, TrendingUp, ShieldCheck, 
  Zap, Award, ArrowRight, UserCheck, CheckCircle2, User, Factory, Store,
  Check, Sparkles, Send
} from 'lucide-react';
import JobCard from '../components/JobCard';
import GlobalSearchBar from '../components/GlobalSearchBar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactEnquirySection from '../components/ContactEnquirySection';

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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col selection:bg-sky-100 overflow-x-hidden">
      {/* Sticky Navigation */}
      <Navbar />

      {/* 1. Hero Section (#home) */}
      <section id="home" className="relative pt-20 md:pt-32 pb-14 md:pb-24 px-4 md:px-6 bg-sky-800 scroll-mt-16 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-bg.png" alt="Office Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-sky-900/75 backdrop-blur-[1px]"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-800/80 text-sky-200 font-medium text-xs md:text-sm mb-5 border border-sky-600/50 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Premier Recruitment & Manpower Solutions
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight mb-4 md:mb-6 leading-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Next Great</span> Opportunity.
          </h1>
          <p className="text-sm sm:text-lg md:text-2xl text-sky-50 mb-8 md:mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Connect with top companies and accelerate your career. Our intelligent matching system finds the perfect role for your skills.
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="h-14 md:h-16 w-full bg-white/20 rounded-2xl animate-pulse"></div>}>
              <GlobalSearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* 2. Find Jobs & Categories Section (#jobs) */}
      <div id="jobs" className="scroll-mt-16">
        {/* Featured Sectors / Categories */}
        <section className="py-14 md:py-20 px-4 md:px-6 bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <span className="text-sky-700 font-bold uppercase tracking-widest text-[11px] md:text-xs mb-1.5 block">Industry Diversity</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 mb-2.5">Explore Top Categories</h2>
              <p className="text-xs sm:text-sm md:text-base text-zinc-600 max-w-2xl mx-auto">Find opportunities across various specialized industries tailored to your career aspirations.</p>
            </div>
          
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {categories.filter((category: any) => category.jobCount > 0).slice(0, 8).map((category: any, index: number) => (
                <Link href={`/jobs?category=${encodeURIComponent(category.name)}`} key={category.id || index} className="bg-white border border-zinc-200 rounded-xl sm:rounded-2xl hover:shadow-xl hover:border-sky-300 transition-all group overflow-hidden flex flex-col h-32 sm:h-36 md:h-48 relative">
                  {category.imageUrl ? (
                    <div className="absolute inset-0 w-full h-full">
                      <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-zinc-100"></div>
                  )}
                  
                  <div className="relative z-10 flex flex-col justify-between h-full p-2.5 sm:p-4 md:p-6 text-white">
                    <div>
                      <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white drop-shadow-md leading-tight line-clamp-1">{category.name}</h3>
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-sky-200 bg-black/40 px-2 py-0.5 rounded-full inline-block mt-1 backdrop-blur-sm border border-white/10">
                        {category.jobCount || 0} Jobs
                      </span>
                    </div>
                    
                    <div className="flex items-center text-[10px] sm:text-xs md:text-sm font-bold text-amber-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 drop-shadow-md">
                      Explore <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8 md:mt-10">
              <Link href="/jobs" className="inline-flex items-center bg-sky-50 text-sky-800 hover:bg-sky-100 font-bold px-6 sm:px-8 py-3 rounded-full transition-all border border-sky-200 hover:shadow-sm text-xs sm:text-sm md:text-base">
                Explore All Categories <ChevronRight className="h-4 w-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Jobs Grid */}
        <section className="py-14 md:py-20 px-4 md:px-6 bg-gradient-to-br from-sky-900 via-sky-950 to-slate-950 relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <div className="text-center mb-8 md:mb-12 relative z-10 max-w-3xl mx-auto">
            <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px] md:text-xs mb-1.5 block">Latest Openings</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2.5">Featured Opportunities</h2>
            <p className="text-xs sm:text-sm md:text-base text-sky-200">Hand-picked vacancies from top employers actively recruiting through Skyo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-6xl mx-auto relative z-10">
            {featuredJobs.length === 0 ? (
              <p className="col-span-3 text-center text-zinc-500 bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200">No featured jobs available right now.</p>
            ) : (
              featuredJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
          <div className="text-center mt-10 md:mt-14 relative z-10">
            <Link href="/jobs" className="inline-flex items-center bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all shadow-[0_10px_25px_rgba(2,132,199,0.35)] hover:shadow-[0_15px_30px_rgba(2,132,199,0.5)] hover:-translate-y-0.5 text-xs sm:text-sm md:text-base">
              Explore All Vacancies <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* 3. Comprehensive About Us, Nature of Business & Business Model (#about) */}
      <section id="about" className="py-14 md:py-24 px-4 md:px-6 bg-white border-b border-zinc-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Centered Big Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-sky-800 font-bold text-[11px] sm:text-xs uppercase tracking-widest mb-3 border border-sky-100">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Who We Are
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-amber-500">Us</span>
            </h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-sky-600 to-amber-500 rounded-full mx-auto mt-3 sm:mt-4 mb-3 sm:mb-4"></div>
            <p className="text-xs sm:text-base md:text-lg text-zinc-600 leading-relaxed max-w-xl mx-auto">
              Empowering individuals and leading enterprises through visionary recruitment and manpower consultancy.
            </p>
          </div>

          {/* Main About Story & Hero */}
          <div className="flex flex-col-reverse lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 mb-16 md:mb-24">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 leading-tight mb-4 md:mb-6">
                Bridging the Gap between <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-sky-600 to-amber-500">Talent & Opportunity</span>
              </h3>
              <p className="text-xs sm:text-base md:text-lg text-zinc-600 mb-4 md:mb-6 leading-relaxed">
                Skyo Consultancy is a premier recruitment and manpower consultancy firm dedicated to empowering businesses and professionals alike. We specialize in matching top-tier talent with world-class employers across diverse industry domains.
              </p>
              <p className="text-xs sm:text-sm md:text-base text-zinc-500 mb-6 md:mb-8 leading-relaxed">
                With a strict commitment to ethical practices, zero recruitment charges for candidates, and high-velocity staffing solutions, we act as the catalyst that accelerates organizational growth and individual career milestones.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href="/#jobs" className="bg-sky-800 hover:bg-sky-700 text-white font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 text-xs sm:text-sm md:text-base w-full sm:w-auto justify-center">
                  Explore Current Openings <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/register-cv" className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all text-xs sm:text-sm md:text-base w-full sm:w-auto text-center">
                  Register Your CV
                </Link>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-amber-500/20 rounded-2xl sm:rounded-[2.5rem] transform rotate-1 sm:rotate-2 scale-105 blur-lg sm:blur-xl"></div>
              <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden border border-zinc-200 shadow-xl sm:shadow-2xl bg-zinc-100">
                <img 
                  src="/about-hero.png" 
                  alt="Skyo Consultancy Professional Team" 
                  className="w-full h-[220px] sm:h-[320px] md:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 text-white">
                  <div className="flex items-center gap-2.5 sm:gap-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/20">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm md:text-base leading-tight">100% Ethical & Verified Network</h4>
                      <p className="text-[10px] sm:text-xs text-sky-100">Zero candidate fees, verified employers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8.7: Nature of Business */}
          <div className="mb-16 md:mb-24 bg-gradient-to-br from-sky-50 via-sky-100/60 to-cyan-50/70 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 md:p-14 border border-sky-200/80 shadow-sm relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200/50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

            <div className="text-center max-w-3xl mx-auto mb-8 md:mb-14 relative z-10">
              <span className="text-sky-800 font-extrabold uppercase tracking-widest text-[11px] md:text-xs mb-2 inline-block bg-sky-200/70 px-3.5 py-1 rounded-full border border-sky-300/70">
                Comprehensive Services
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-900 mb-2.5">Nature of Business</h3>
              <p className="text-xs sm:text-base md:text-lg text-slate-700">
                We deliver a complete suite of manpower, recruitment, and corporate consulting solutions tailored to organizational success.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 md:gap-6 relative z-10">
              {/* 1. Manpower consultancy services */}
              <div className="bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-sky-100/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10 transition-all group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-sky-100 text-sky-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-sky-800 group-hover:text-white transition-all shadow-sm">
                    <Users className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-sky-700 mb-1">01. Workforce Solutions</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 mb-2 sm:mb-3 group-hover:text-sky-800 transition-colors leading-snug">
                    Manpower Consultancy Services
                  </h4>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                    Strategic workforce planning, talent acquisition, and workforce sizing to ensure businesses possess the ideal human capital for operational excellence.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 flex items-center text-[11px] sm:text-xs font-bold text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mr-1.5 sm:mr-2 shrink-0" /> End-to-end Talent Pipeline
                </div>
              </div>

              {/* 2. Recruitment and placement services */}
              <div className="bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-sky-100/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10 transition-all group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-cyan-100 text-cyan-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-cyan-700 group-hover:text-white transition-all shadow-sm">
                    <Target className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-cyan-700 mb-1">02. Talent Sourcing</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 mb-2 sm:mb-3 group-hover:text-cyan-700 transition-colors leading-snug">
                    Recruitment & Placement Services
                  </h4>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                    Precision headhunting, thorough candidate vetting, and tailored placement aligning skillsets and cultural fit with corporate requirements.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 flex items-center text-[11px] sm:text-xs font-bold text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mr-1.5 sm:mr-2 shrink-0" /> Verified Candidate Matching
                </div>
              </div>

              {/* 3. Staffing solutions (temporary/permanent) */}
              <div className="bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-sky-100/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10 transition-all group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-amber-100 text-amber-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                    <Layers className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-amber-700 mb-1">03. Agile Staffing</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 mb-2 sm:mb-3 group-hover:text-amber-700 transition-colors leading-snug">
                    Staffing Solutions (Temp / Permanent)
                  </h4>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                    Flexible hiring frameworks including contract-to-hire, temporary staffing for seasonal spikes, and permanent executive deployments.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 flex items-center text-[11px] sm:text-xs font-bold text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mr-1.5 sm:mr-2 shrink-0" /> Flexible Contract Frameworks
                </div>
              </div>

              {/* 4. HR consultancy and payroll support */}
              <div className="bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-sky-100/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10 transition-all group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-emerald-100 text-emerald-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all shadow-sm">
                    <FileSpreadsheet className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-emerald-700 mb-1">04. HR Operations</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 mb-2 sm:mb-3 group-hover:text-emerald-700 transition-colors leading-snug">
                    HR Consultancy & Payroll Support
                  </h4>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                    Complete human resource management advisory, seamless payroll processing, attendance integration, and performance management systems.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 flex items-center text-[11px] sm:text-xs font-bold text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mr-1.5 sm:mr-2 shrink-0" /> Automated & Accurate Payroll
                </div>
              </div>

              {/* 5. Statutory consultant */}
              <div className="bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-sky-100/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10 transition-all group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-indigo-100 text-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-indigo-700 group-hover:text-white transition-all shadow-sm">
                    <Scale className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-indigo-700 mb-1">05. Legal & Compliance</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 mb-2 sm:mb-3 group-hover:text-indigo-700 transition-colors leading-snug">
                    Statutory Consultant
                  </h4>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                    Adherence to labor laws, EPF/ESI statutory compliance, factory act regulations, audit readiness, and risk mitigation for enterprise peace of mind.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 flex items-center text-[11px] sm:text-xs font-bold text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mr-1.5 sm:mr-2 shrink-0" /> 100% Labor Law Compliance
                </div>
              </div>

              {/* 6. Business consultant */}
              <div className="bg-white hover:bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-sky-100/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/10 transition-all group flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-rose-100 text-rose-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:bg-rose-700 group-hover:text-white transition-all shadow-sm">
                    <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-rose-700 mb-1">06. Strategic Growth</div>
                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 mb-2 sm:mb-3 group-hover:text-rose-700 transition-colors leading-snug">
                    Business Consultant
                  </h4>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                    Corporate organizational structuring, process optimization, workflow streamlining, and strategic guidance for sustainable market expansion.
                  </p>
                </div>
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-100 flex items-center text-[11px] sm:text-xs font-bold text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mr-1.5 sm:mr-2 shrink-0" /> Sustainable Business Growth
                </div>
              </div>
            </div>
          </div>

          {/* About: Our Business Model Diagram */}
          <div className="mb-14 md:mb-20 bg-gradient-to-br from-sky-900 via-sky-950 to-slate-900 rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 md:p-14 text-white shadow-2xl relative overflow-hidden border border-sky-800">
            {/* Background ambient lighting */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 text-center max-w-3xl mx-auto mb-8 sm:mb-14">
              <span className="text-amber-400 font-bold uppercase tracking-widest text-[11px] md:text-xs mb-1.5 block">Ecosystem Architecture</span>
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4">Our Business Model</h3>
              <p className="text-xs sm:text-sm md:text-base text-sky-200">
                How Skyo operates as the central recruitment nexus connecting ambitious individuals with prominent corporate enterprises.
              </p>
            </div>

            {/* Visual Flow Diagram */}
            <div className="relative z-10 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 sm:gap-6 items-center">
                
                {/* Left Side: Individual Users */}
                <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-400/20 text-sky-300 flex items-center justify-center font-bold">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <h4 className="font-bold text-sm sm:text-base md:text-lg text-white">Individual Users</h4>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">Job Seekers</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-500/30 flex items-center justify-center text-sky-200 shrink-0">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Fresh Graduates</p>
                        <p className="text-[9px] sm:text-[10px] text-sky-300">Entry Level</p>
                      </div>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-200 shrink-0">
                        <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Skilled Talent</p>
                        <p className="text-[9px] sm:text-[10px] text-cyan-300">IT & Tech</p>
                      </div>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-200 shrink-0">
                        <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Experienced</p>
                        <p className="text-[9px] sm:text-[10px] text-emerald-300">Mid-Senior</p>
                      </div>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-200 shrink-0">
                        <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Executives</p>
                        <p className="text-[9px] sm:text-[10px] text-amber-300">Leadership</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs text-sky-200/80 bg-sky-950/50 p-2.5 sm:p-3 rounded-xl border border-sky-800/40 text-center">
                    ✓ 100% Free registration & verified applications
                  </p>
                </div>

                {/* Center Hub: Skyo Recruit Group */}
                <div className="lg:col-span-3 flex flex-col items-center justify-center py-2 sm:py-4">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-b from-sky-700 to-sky-900 border-3 sm:border-4 border-white/40 shadow-2xl flex flex-col items-center justify-center p-2.5 sm:p-4 text-center">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mb-0.5 sm:mb-1 text-white">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h4 className="font-black text-xs sm:text-sm md:text-base text-white tracking-wide leading-tight">
                        Recruit<br/>Group
                      </h4>
                      <span className="text-[8px] sm:text-[10px] font-bold text-amber-300 mt-0.5 sm:mt-1 uppercase tracking-wider">Skyo Hub</span>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-sky-200 font-medium bg-white/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-bounce" />
                    Intelligent Matching Engine
                  </div>
                </div>

                {/* Right Side: Business Clients */}
                <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <h4 className="font-bold text-sm sm:text-base md:text-lg text-white">Business Clients</h4>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">Employers</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-amber-200 shrink-0">
                        <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Enterprises</p>
                        <p className="text-[9px] sm:text-[10px] text-amber-300">Corporates</p>
                      </div>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2 sm:gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-200 shrink-0">
                        <Factory className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Industries</p>
                        <p className="text-[9px] sm:text-[10px] text-blue-300">Manufacturing</p>
                      </div>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-200 shrink-0">
                        <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Startups & SMBs</p>
                        <p className="text-[9px] sm:text-[10px] text-purple-300">Growth Firms</p>
                      </div>
                    </div>

                    <div className="bg-white/5 hover:bg-white/10 transition-colors p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 flex items-center gap-2.5">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-500/30 flex items-center justify-center text-teal-200 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">Healthcare</p>
                        <p className="text-[9px] sm:text-[10px] text-teal-300">Hospitals & Labs</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs text-sky-200/80 bg-sky-950/50 p-2.5 sm:p-3 rounded-xl border border-sky-800/40 text-center">
                    ✓ Rapid candidate deployment & payroll support
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Why Choose Us & Principles */}
          <div className="bg-zinc-50 rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 md:p-14 border border-zinc-200/80">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-zinc-900 mb-2">Why Industry Leaders Choose Skyo</h3>
              <p className="text-xs sm:text-sm md:text-base text-zinc-600">Built on principles of reliability, fast turnaround, and uncompromising ethics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-200 shadow-sm flex items-start gap-3.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-lg sm:rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm sm:text-base mb-1">Fast Turnaround</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Pre-screened talent pools enable rapid hiring cycles to fill urgent openings within days.</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-200 shadow-sm flex items-start gap-3.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg sm:rounded-xl flex items-center justify-center text-green-600 shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm sm:text-base mb-1">100% Ethical Practices</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Zero candidate fees, strict anti-child labour adherence, and compliant contract staffing.</p>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-200 shadow-sm flex items-start gap-3.5 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 rounded-lg sm:rounded-xl flex items-center justify-center text-sky-600 shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm sm:text-base mb-1">Sector Expertise</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Dedicated domain experts in IT, Non-IT, Engineering, Healthcare, and Financial services.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Register with Us / Upload Resume Section */}
      <section className="py-14 md:py-24 px-4 md:px-6 bg-[#f3f6fc]">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row relative min-h-auto md:min-h-[600px] p-6 sm:p-10 md:p-16">
            
            {/* Left Content */}
            <div className="md:w-1/2 flex flex-col justify-center relative z-20 md:pr-12 text-center md:text-left mt-4 md:mt-0">
              <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-8 sm:w-12 h-0.5 bg-sky-700 hidden md:block"></div>
                <span className="text-amber-500 font-bold tracking-wide text-sm sm:text-lg">Join Our Network</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 sm:mb-6 leading-[1.15] text-zinc-900 font-serif mx-auto md:mx-0">
                Upload Your Resume <br className="hidden sm:block"/>
                <span className="text-amber-500 font-sans tracking-tight"> Find Your Job</span>
              </h2>
              <p className="text-zinc-600 mb-2 md:mb-10 leading-relaxed text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0">
                Do you want to get started, but have not found the ideal job vacancy yet? Register with us and let the perfect opportunity find you.
              </p>
              
              {/* Desktop Button */}
              <div className="hidden md:block">
                <Link href="/register-cv" className="inline-flex items-center justify-center bg-sky-800 hover:bg-sky-700 text-white font-medium px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto">
                  Submit Your CV
                </Link>
              </div>
            </div>

            {/* Right Images Composition */}
            <div className="w-full md:w-1/2 relative flex justify-center items-center z-10 md:min-h-[500px] overflow-hidden md:overflow-visible -my-[80px] sm:-my-[40px] md:my-0">
              
              {/* Scale wrapper to keep perfect proportions on all devices */}
              <div className="relative w-[500px] h-[500px] scale-[0.65] sm:scale-[0.8] md:scale-100 origin-center flex-shrink-0">
                
                {/* Decorative Shapes */}
                <div className="absolute top-[10%] left-[10%] w-48 h-48 bg-[#FCD34D] rounded-full mix-blend-multiply opacity-90 z-0"></div>
                <div className="absolute top-[5%] right-[5%] w-64 h-80 bg-[#FDBA74] rounded-full mix-blend-multiply opacity-80 z-0 transform rotate-12"></div>
                <div className="absolute bottom-[5%] right-[10%] w-40 h-40 bg-[#93C5FD] rounded-full mix-blend-multiply opacity-90 z-0"></div>

                {/* Sparkles */}
                <svg className="absolute top-[5%] left-[45%] w-10 h-10 text-sky-200 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z"/></svg>
                <svg className="absolute bottom-[10%] right-[35%] w-8 h-8 text-sky-200 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z"/></svg>
                
                {/* Left Pill Image */}
                <div className="absolute left-[8%] top-[25%] w-40 h-64 rounded-[4rem] border-[6px] border-white shadow-xl overflow-hidden z-20">
                  <img src="/images/user-uploaded-cv.jpg" alt="Student" className="w-full h-full object-cover" />
                </div>
                
                {/* Middle Tall Pill Image */}
                <div className="absolute left-[50%] -translate-x-1/2 top-[10%] w-48 h-96 rounded-[5rem] border-[6px] border-white shadow-2xl overflow-hidden z-30">
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Working" className="w-full h-full object-cover" />
                </div>
                
                {/* Right Pill Image */}
                <div className="absolute right-[8%] top-[20%] w-40 h-64 rounded-[4rem] border-[6px] border-white shadow-xl overflow-hidden z-10">
                  <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Writing" className="w-full h-full object-cover" />
                </div>

                {/* Small Profile Circles */}
                <div className="absolute left-[5%] bottom-[20%] w-16 h-16 rounded-full border-4 border-[#10B981] bg-white overflow-hidden z-40 shadow-xl">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-full h-full object-cover" />
                </div>
                
                <div className="absolute right-[2%] top-[12%] w-16 h-16 rounded-full border-4 border-[#34D399] bg-white overflow-hidden z-40 shadow-xl">
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-full h-full object-cover" />
                </div>

              </div>
            </div>

            {/* Mobile Button */}
            <div className="md:hidden w-full mt-2 flex justify-center z-20">
              <Link href="/register-cv" className="inline-flex items-center justify-center bg-sky-800 hover:bg-sky-700 text-white font-medium px-6 py-4 rounded-xl transition-all shadow-lg w-full text-sm sm:text-base">
                Submit Your CV
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Contact Enquiry Section */}
      <ContactEnquirySection />

      {/* 5. Contact Us / Social Awareness Section (#contact) */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
