import React from 'react';
import Link from 'next/link';
import { MapPin, Users } from 'lucide-react';

interface JobCardProps {
  job: any;
  showAppliedBadge?: boolean;
}

export default function JobCard({ job, showAppliedBadge }: JobCardProps) {
  return (
    <div className="group bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
      
      <div>
        <div className="flex justify-between items-start mb-3 md:mb-4">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.title)}&background=random&color=fff&size=128&rounded=false`} 
            alt={job.title} 
            className="h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover shadow-sm"
          />
          <div className="flex flex-col items-end">
            {showAppliedBadge && (
              <span className="text-[10px] md:text-xs font-bold text-green-700 bg-green-100 px-2 py-1 md:px-3 md:py-1 rounded-full mb-2 inline-flex items-center gap-1 shadow-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Applied
              </span>
            )}
            <span className="text-[10px] md:text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded-md inline-block uppercase tracking-wider">{job.jobCode}</span>
          </div>
        </div>
        
        <h3 className="text-lg md:text-xl font-bold text-zinc-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">{job.title}</h3>
        
        <div className="flex items-center gap-2 text-zinc-600 mb-3 md:mb-4 text-xs md:text-sm font-medium">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-zinc-400" /> {job.locationCity}, {job.locationState}</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
          <span className="px-2.5 md:px-3 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-full text-[10px] md:text-xs font-bold">{job.jobType}</span>
          <span className="px-2.5 md:px-3 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-full text-[10px] md:text-xs font-bold">{(typeof job.category === 'object' ? job.category?.name : job.category) || 'General'}</span>
          <span className="px-2.5 md:px-3 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-full text-[10px] md:text-xs font-bold">{job.workMode}</span>
        </div>

        {/* Reviewing Applications Counter */}
        {job.reviewedApplicationsCount > 0 && (
          <div className="mb-3 md:mb-4 inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] md:text-xs font-bold border border-amber-100">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Reviewing Applications: {job.reviewedApplicationsCount}
          </div>
        )}
      </div>
      
      <Link href={`/jobs/${job.id}`} className="block w-full text-center py-2 md:py-3.5 border-2 border-zinc-100 text-zinc-900 font-bold rounded-xl text-sm md:text-base hover:bg-blue-800 hover:border-blue-800 hover:text-white transition-all mt-4 md:mt-6 group-hover:shadow-lg">
        View Details
      </Link>
    </div>
  );
}
