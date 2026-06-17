'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import JobCard from '../../components/JobCard';
import { MapPin, Filter, ChevronRight, Clock, Building, Briefcase, ChevronLeft } from 'lucide-react';
import ShareButton from '../../components/ShareButton';
import GlobalSearchBar from '../../components/GlobalSearchBar';

export default function JobsClient({ 
  initialJobs, 
  initialCategories = [],
  initialQuery = '', 
  initialLoc = '',
  initialCategory = ''
}: { 
  initialJobs: any[], 
  initialCategories?: any[],
  initialQuery?: string, 
  initialLoc?: string,
  initialCategory?: string 
}) {
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const filteredJobs = useMemo(() => {
    return initialJobs.filter(job => {
      // Only show active jobs to users
      if (job.status && job.status !== 'ACTIVE') return false;

      // Job Type filtering
      const matchType = selectedJobType === 'All' || job.jobType === selectedJobType;
      
      // Experience filtering
      // Since 'Fresher' is an explicit option in our DB schema, anything else is 'Experience'
      const isExperience = job.experienceLevel && job.experienceLevel !== 'Fresher';
      const matchExp = selectedExperience === 'All' || 
        (selectedExperience === 'Fresher' && job.experienceLevel === 'Fresher') ||
        (selectedExperience === 'Experience' && isExperience);

      // Title filtering from query
      const matchTitle = !initialQuery.trim() || 
        (job.title && job.title.toLowerCase().includes(initialQuery.toLowerCase()));

      // Location filtering
      const locSearch = initialLoc.toLowerCase().trim();
      const combinedLoc = `${job.locationCity || ''}, ${job.locationState || ''}`.toLowerCase();
      const matchLoc = !locSearch || 
        combinedLoc.includes(locSearch) ||
        (job.locationCity && job.locationCity.toLowerCase().includes(locSearch)) || 
        (job.locationState && job.locationState.toLowerCase().includes(locSearch));
        
      // Category filtering
      const matchCategory = selectedCategory === 'All' || 
        (job.category && job.category.toLowerCase() === selectedCategory.toLowerCase());
        
      return matchType && matchExp && matchTitle && matchLoc && matchCategory;
    });
  }, [initialJobs, selectedJobType, selectedExperience, selectedCategory, initialLoc, initialQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJobType, selectedExperience, selectedCategory, initialLoc, initialQuery]);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Header Search */}
      <div className="bg-[#0B132B] relative py-12 px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-indigo-900/40"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="max-w-5xl mx-auto flex flex-col gap-6 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-black text-white tracking-tight">Explore Open Roles</h1>
            <p className="text-blue-50 mt-3 font-medium text-lg">Find the perfect match for your skills and experience</p>
          </div>
          <div className="max-w-4xl mx-auto w-full relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
            <GlobalSearchBar initialQ={initialQuery} initialLoc={initialLoc} />
          </div>
        </div>
      </div>

      <main className="w-full px-4 md:px-8 lg:px-12 py-8 flex flex-col gap-8 items-start">
        {/* Job Results Container */}
        <div className="w-full">
          {/* Horizontal Filters Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-8 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center gap-2 px-2 xl:border-r border-zinc-200">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="font-black text-sm text-zinc-800">Filters:</span>
              </div>
              
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 min-w-[140px] bg-white border border-zinc-200 text-zinc-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-bold cursor-pointer"
              >
                <option value="All">All Categories</option>
                {initialCategories && initialCategories.map((c: any) => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select 
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="flex-1 min-w-[140px] bg-white border border-zinc-200 text-zinc-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-bold cursor-pointer"
              >
                <option value="All">All Job Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
              </select>

              <select 
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="flex-1 min-w-[140px] bg-white border border-zinc-200 text-zinc-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm font-bold cursor-pointer"
              >
                <option value="All">All Experience</option>
                <option value="Fresher">Fresher</option>
                <option value="Experience">Experience</option>
              </select>

              {(selectedJobType !== 'All' || selectedExperience !== 'All' || selectedCategory !== 'All') && (
                <button 
                  onClick={() => { setSelectedJobType('All'); setSelectedExperience('All'); setSelectedCategory('All'); }}
                  className="text-sm text-blue-600 font-bold hover:underline px-2 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto shrink-0 justify-between xl:justify-end pt-4 xl:pt-0 border-t xl:border-t-0 border-zinc-100">
              <span className="text-sm font-black text-zinc-800 bg-zinc-100 px-3 py-1.5 rounded-lg">{filteredJobs.length} jobs found</span>
              <select className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 outline-none hover:border-zinc-300 transition-colors cursor-pointer shadow-sm">
                <option>Latest Jobs</option>
                <option>Last 7 Days</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-zinc-200 shadow-sm col-span-full">
                <Briefcase className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-zinc-800 mb-1">No jobs found</h3>
                <p className="text-zinc-500 text-sm">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              currentJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-blue-800 text-white shadow-sm' 
                      : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
