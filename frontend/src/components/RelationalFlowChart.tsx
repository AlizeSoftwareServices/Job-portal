'use client';
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Briefcase, FileText, Layers, Users } from 'lucide-react';

interface RelationalFlowChartProps {
  categories: any[];
  jobs: any[];
  applications: any[];
}

type FlowLevel = 'categories' | 'jobs' | 'applications';

export default function RelationalFlowChart({ categories, jobs, applications }: RelationalFlowChartProps) {
  const [level, setLevel] = useState<FlowLevel>('categories');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Derive unique categories from jobs if category list is empty or for safety
  const activeCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const catSet = new Set(jobs.map(j => j.category?.name).filter(Boolean));
    return Array.from(catSet).map(name => ({ id: name, name }));
  }, [categories, jobs]);

  // Derive active jobs for selected category
  const categoryJobs = useMemo(() => {
    if (!selectedCategory) return [];
    return jobs.filter(j => j.status === 'ACTIVE' && (j.category?.name === selectedCategory.name || j.categoryId === selectedCategory.id));
  }, [jobs, selectedCategory]);

  // Derive applications for selected job
  const jobApplications = useMemo(() => {
    if (!selectedJob) return [];
    return applications.filter(a => a.job?.id === selectedJob.id || a.jobId === selectedJob.id);
  }, [applications, selectedJob]);

  const handleCategoryClick = (cat: any) => {
    setSelectedCategory(cat);
    setLevel('jobs');
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setLevel('applications');
  };

  const goBackToCategories = () => {
    setLevel('categories');
    setSelectedCategory(null);
    setSelectedJob(null);
  };

  const goBackToJobs = () => {
    setLevel('jobs');
    setSelectedJob(null);
  };

  // Connecting line styles
  const lineClasses = "relative before:content-[''] before:absolute before:left-[-24px] before:top-1/2 before:-translate-y-1/2 before:w-6 before:h-px before:bg-slate-300";

  return (
    <div className="w-full min-h-[500px] flex flex-col font-sans relative overflow-hidden bg-slate-50/50 p-6 rounded-xl border border-slate-100">
      
      {/* Breadcrumbs / Header */}
      <div className="flex items-center gap-2 mb-8 text-sm font-bold text-slate-500 bg-white p-3 rounded-lg shadow-sm w-fit border border-slate-200">
        <button 
          onClick={goBackToCategories} 
          className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${level === 'categories' ? 'text-blue-800' : ''}`}
        >
          <Layers className="h-4 w-4" /> Categories
        </button>
        
        {level !== 'categories' && selectedCategory && (
          <>
            <span className="text-slate-300">/</span>
            <button 
              onClick={goBackToJobs}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${level === 'jobs' ? 'text-blue-800' : ''}`}
            >
              <Briefcase className="h-4 w-4" /> {selectedCategory.name}
            </button>
          </>
        )}
        
        {level === 'applications' && selectedJob && (
          <>
            <span className="text-slate-300">/</span>
            <span className="flex items-center gap-1 text-blue-800">
              <FileText className="h-4 w-4" /> {selectedJob.title}
            </span>
          </>
        )}
      </div>

      <div className="flex-1 flex w-full relative">
        {/* CATEGORY COLUMN */}
        <div className={`flex flex-col gap-4 min-w-[280px] z-10 transition-all duration-500 ease-in-out ${level === 'categories' ? 'w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'w-[280px] shrink-0'}`}>
          {level === 'categories' ? (
            activeCategories.map(cat => {
              const activeJobsCount = jobs.filter(j => j.status === 'ACTIVE' && (j.category?.name === cat.name || j.categoryId === cat.id)).length;
              return (
                <div 
                  key={cat.id || cat.name} 
                  onClick={() => handleCategoryClick(cat)}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{cat.name}</h4>
                      <p className="text-xs text-slate-500">{activeJobsCount} Active Jobs</p>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-blue-500 transition-colors">&rarr;</div>
                </div>
              );
            })
          ) : (
            // Show only the selected category when drilled down
            <div className="bg-white p-5 rounded-xl border-2 border-blue-400 shadow-md relative z-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{selectedCategory?.name}</h4>
                  <p className="text-xs text-slate-500">{categoryJobs.length} Active Jobs</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* JOBS COLUMN */}
        {level !== 'categories' && (
          <div className="flex-1 flex relative animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Horizontal connecting line from category */}
            <div className="w-12 h-px bg-slate-300 absolute left-0 top-[42px] -ml-6 z-0 hidden lg:block"></div>
            
            <div className={`ml-8 lg:ml-12 flex flex-col gap-4 z-10 w-full ${level === 'jobs' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'w-[320px] shrink-0'}`}>
              
              {level === 'jobs' && (
                <button onClick={goBackToCategories} className="mb-2 text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline w-fit">
                  <ArrowLeft className="h-4 w-4" /> Back to Categories
                </button>
              )}

              {level === 'jobs' ? (
                categoryJobs.length > 0 ? (
                  categoryJobs.map(job => {
                    const appsCount = applications.filter(a => a.job?.id === job.id || a.jobId === job.id).length;
                    return (
                      <div 
                        key={job.id} 
                        onClick={() => handleJobClick(job)}
                        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between group ${lineClasses}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Briefcase className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1" title={job.title}>{job.title}</h4>
                            <p className="text-xs text-slate-500">{appsCount} Applications</p>
                          </div>
                        </div>
                        <div className="text-slate-300 group-hover:text-blue-500 transition-colors">&rarr;</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 italic p-4 text-sm">No active jobs in this category.</div>
                )
              ) : (
                // Show only selected job when drilled down further
                <div className={`bg-white p-4 rounded-xl border-2 border-emerald-400 shadow-md relative z-20 flex items-center justify-between ${lineClasses}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1" title={selectedJob?.title}>{selectedJob?.title}</h4>
                      <p className="text-xs text-slate-500">{jobApplications.length} Applications</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* APPLICATIONS COLUMN */}
        {level === 'applications' && (
          <div className="flex-1 flex flex-col relative animate-in fade-in slide-in-from-right-8 duration-500 ml-8 lg:ml-12 w-full h-full">
            <button onClick={goBackToJobs} className="mb-6 text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline w-fit">
              <ArrowLeft className="h-4 w-4" /> Back to Jobs
            </button>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-8 h-fit max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {jobApplications.length > 0 ? (
                jobApplications.map(app => {
                  const name = app.candidate?.candidateProfile?.fullName || app.firstName + ' ' + (app.lastName || '') || app.candidate?.firstName || 'Unknown Candidate';
                  const statusColors: any = {
                    'APPLIED': 'bg-slate-100 text-slate-700',
                    'UNDER_REVIEW': 'bg-amber-100 text-amber-700',
                    'SHORTLISTED': 'bg-blue-100 text-blue-700',
                    'INTERVIEW_SCHEDULED': 'bg-purple-100 text-purple-700',
                    'SELECTED': 'bg-emerald-100 text-emerald-700',
                    'REJECTED': 'bg-red-100 text-red-700'
                  };
                  return (
                    <div key={app.id} className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between ${lineClasses}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-sm text-slate-800 truncate" title={name}>{name.trim() === 'undefined' || name.trim() === 'null' ? 'Unknown' : name}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{app.email || app.candidate?.email || 'No email'}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${statusColors[app.status] || 'bg-slate-50 border-slate-200'}`}>
                        {app.status === 'SELECTED' ? 'APPOINTED' : app.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic p-4 text-sm">No applications for this job yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
