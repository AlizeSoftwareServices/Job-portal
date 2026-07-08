'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Briefcase, Layers, Users, ChevronRight } from 'lucide-react';

interface RelationalFlowChartProps {
  categories?: any[];
  jobs?: any[];
  applications?: any[];
  categoryDetailedList?: any[];
}

export default function RelationalFlowChart({ categories = [], jobs = [], applications = [], categoryDetailedList = [] }: RelationalFlowChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [lazyApplications, setLazyApplications] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  // Derive unique categories from jobs if category list is empty or for safety
  const activeCategories = useMemo(() => {
    if (categoryDetailedList && categoryDetailedList.length > 0) return categoryDetailedList.filter(c => c.jobs && c.jobs.length > 0);
    if (categories && categories.length > 0) return categories;
    const catSet = new Set(jobs.map(j => j.category?.name).filter(Boolean));
    return Array.from(catSet).map(name => ({ id: name, name }));
  }, [categories, jobs, categoryDetailedList]);

  // Derive active jobs for selected category
  const categoryJobs = useMemo(() => {
    if (!selectedCategory) return [];
    if (categoryDetailedList && categoryDetailedList.length > 0) return selectedCategory.jobs;
    return jobs.filter(j => j.status === 'ACTIVE' && (j.category?.name === selectedCategory.name || j.categoryId === selectedCategory.id));
  }, [jobs, selectedCategory, categoryDetailedList]);

  // Derive applications for selected job
  const jobApplications = useMemo(() => {
    if (!selectedJob) return [];
    if (categoryDetailedList && categoryDetailedList.length > 0) return lazyApplications;
    return applications.filter(a => a.job?.id === selectedJob.id || a.jobId === selectedJob.id);
  }, [applications, selectedJob, categoryDetailedList, lazyApplications]);

  useEffect(() => {
    if (selectedJob && categoryDetailedList && categoryDetailedList.length > 0) {
      setIsLoadingApps(true);
      fetch(`/api/applications/job/${selectedJob.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setLazyApplications(data);
          else setLazyApplications([]);
        })
        .catch(err => {
          console.error(err);
          setLazyApplications([]);
        })
        .finally(() => setIsLoadingApps(false));
    } else {
      setLazyApplications([]);
    }
  }, [selectedJob, categoryDetailedList]);

  const handleCategoryClick = (cat: any) => {
    if (selectedCategory?.id === cat.id && selectedCategory?.name === cat.name) {
      setSelectedCategory(null);
      setSelectedJob(null);
    } else {
      setSelectedCategory(cat);
      setSelectedJob(null);
    }
  };

  const handleJobClick = (job: any) => {
    if (selectedJob?.id === job.id) {
      setSelectedJob(null);
    } else {
      setSelectedJob(job);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 font-sans bg-slate-50/50 p-6 rounded-xl border border-slate-100 min-h-[500px]">
      
      {/* CATEGORIES COLUMN */}
      <div className={`flex flex-col gap-3 transition-all duration-300 ${selectedCategory ? 'lg:w-[300px]' : 'w-full'}`}>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Categories
        </h3>
        <div className={`grid gap-3 ${selectedCategory ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {activeCategories.map((cat) => {
            const isSelected = selectedCategory?.name === cat.name;
            const activeJobsCount = categoryDetailedList && categoryDetailedList.length > 0 ? (cat.jobs?.length || 0) : jobs.filter(j => j.status === 'ACTIVE' && (j.category?.name === cat.name || j.categoryId === cat.id)).length;
            
            return (
              <div 
                key={cat.id || cat.name} 
                onClick={() => handleCategoryClick(cat)}
                className={`p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center justify-between group
                  ${isSelected ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${isSelected ? 'bg-blue-600 text-white' : 'bg-orange-100 text-orange-600'}`}>
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg line-clamp-1 ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{cat.name}</h4>
                    <p className={`text-xs ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{activeJobsCount} Active Jobs</p>
                  </div>
                </div>
                {isSelected && <ChevronRight className="w-5 h-5 text-blue-500" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* JOBS COLUMN */}
      {selectedCategory && (
        <div className={`flex flex-col gap-3 transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${selectedJob ? 'lg:w-[320px]' : 'flex-1'}`}>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Jobs in {selectedCategory.name}
          </h3>
          <div className={`grid gap-3 ${selectedJob ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {categoryJobs.length > 0 ? categoryJobs.map((job: any) => {
              const isSelected = selectedJob?.id === job.id;
              const appsCount = categoryDetailedList && categoryDetailedList.length > 0 ? (job.appsCount || 0) : applications.filter(a => a.job?.id === job.id || a.jobId === job.id).length;
              
              return (
                <div 
                  key={job.id} 
                  onClick={() => handleJobClick(job)}
                  className={`p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center justify-between group
                    ${isSelected ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400' : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <h4 className={`font-bold line-clamp-1 truncate ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`} title={job.title}>{job.title}</h4>
                      <p className={`text-xs ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>{appsCount} Applications</p>
                    </div>
                  </div>
                  {isSelected && <ChevronRight className="w-5 h-5 text-emerald-600 shrink-0" />}
                </div>
              );
            }) : (
              <div className="text-slate-500 italic p-4 text-sm bg-white border border-slate-200 rounded-xl">No active jobs in this category.</div>
            )}
          </div>
        </div>
      )}

      {/* APPLICATIONS COLUMN */}
      {selectedJob && (
        <div className="flex-1 flex flex-col gap-3 transition-all duration-300 animate-in fade-in slide-in-from-left-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Applications for {selectedJob.title}
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {isLoadingApps ? (
              <div className="text-slate-500 italic p-4 text-sm bg-white border border-slate-200 rounded-xl xl:col-span-2">
                Loading applications...
              </div>
            ) : jobApplications.length > 0 ? jobApplications.map(app => {
              
              // FIX: Determine name safely without yielding 'undefined undefined'
              let name = 'Unknown Candidate';
              if (app.candidate?.candidateProfile?.fullName) {
                name = app.candidate.candidateProfile.fullName;
              } else if (app.firstName || app.lastName) {
                name = `${app.firstName || ''} ${app.lastName || ''}`.trim();
              } else if (app.candidate?.firstName || app.candidate?.lastName) {
                name = `${app.candidate.firstName || ''} ${app.candidate.lastName || ''}`.trim();
              }
              
              if (!name) name = 'Unknown Candidate';

              const phone = app.phone || app.candidate?.candidateProfile?.phone || 'No phone provided';
              const resume = app.resumeUrl || app.candidate?.candidateProfile?.resumeUrl;

              const statusColors: any = {
                'APPLIED': 'bg-slate-100 text-slate-700',
                'UNDER_REVIEW': 'bg-amber-100 text-amber-700',
                'SHORTLISTED': 'bg-blue-100 text-blue-700',
                'INTERVIEW_SCHEDULED': 'bg-purple-100 text-purple-700',
                'SELECTED': 'bg-emerald-100 text-emerald-700',
                'REJECTED': 'bg-red-100 text-red-700'
              };

              return (
                <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="truncate flex-1">
                        <h4 className="font-bold text-slate-800 truncate" title={name}>{name}</h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                    <span className="text-xs text-slate-400 font-medium">{new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      {resume && (
                        <a href={resume} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                          View Resume
                        </a>
                      )}
                      <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${statusColors[app.status] || 'bg-slate-50 border-slate-200'}`}>
                        {app.status === 'SELECTED' ? 'APPOINTED' : app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-slate-500 italic p-4 text-sm bg-white border border-slate-200 rounded-xl xl:col-span-2">No applications for this job yet.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
