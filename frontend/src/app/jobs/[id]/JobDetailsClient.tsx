'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShareButton from '../../../components/ShareButton';
import { MapPin, Briefcase, Clock, Building, ArrowLeft, UploadCloud, CheckCircle2, Share2, Users } from 'lucide-react';

export default function JobDetailsClient({ job }: { job: any }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const router = useRouter();
  
  const [hasApplied, setHasApplied] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('skyo_token');
    if (token && job) {
      fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(profile => {
        setCandidateProfile(profile);
        if (profile.applications) {
          const applied = profile.applications.some((app: any) => app.jobId === job.id);
          setHasApplied(applied);
        }
      })
      .catch(console.error);

      // Check saved status
      fetch(`${API_URL}/jobs/${job.id}/save`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setIsSaved(data.isSaved);
      })
      .catch(console.error);
    }
  }, [job, API_URL]);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('skyo_token');
    if (!token) {
      router.push('/login');
    } else {
      if (candidateProfile) {
        // Check if profile is complete
        const profile = candidateProfile.candidateProfile;
        const isComplete = profile?.fullName && profile?.phone && profile?.preferredLocation && profile?.educationQualification && profile?.totalWorkExperienceYears && profile?.resumeUrl;
        
        if (!isComplete) {
          alert('Please complete your candidate profile (including Resume) before applying for jobs.');
          router.push('/profile');
          return;
        }
      }
      router.push(`/jobs/${job.id}/apply`);
    }
  };

  const handleSaveClick = async () => {
    const token = localStorage.getItem('skyo_token');
    if (!token) {
      router.push('/login');
    } else {
      if (savingJob) return;
      setSavingJob(true);
      try {
        const res = await fetch(`${API_URL}/jobs/${job.id}/save`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setIsSaved(data.isSaved);
        }
      } catch (err) {
        console.error('Failed to save job', err);
      } finally {
        setSavingJob(false);
      }
    }
  };

  if (!job) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 shadow-sm">
        Job not found or has been removed.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-8 border-b border-zinc-200">
              <div className="flex items-start gap-5 mb-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.title)}&background=random&color=fff&size=128&rounded=false`} 
                  alt={job.title} 
                  className="h-16 w-16 rounded-xl object-cover shadow-sm hidden sm:block"
                />
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{typeof job.category === 'object' ? job.category?.name : job.category}</span>
                    <span className="inline-block bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{job.jobCode}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-zinc-600 mb-6 text-sm sm:text-base mt-4">
                <span className="flex items-center gap-1.5"><Building className="h-5 w-5" /> SkyoConsultancy Platform</span>
                {(job.fieldVisibility?.locationCity !== false && job.fieldVisibility?.locationState !== false) && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-5 w-5" /> {job.locationCity}, {job.locationState}</span>
                )}
                {job.fieldVisibility?.jobType !== false && (
                  <span className="flex items-center gap-1.5"><Briefcase className="h-5 w-5" /> {job.jobType}</span>
                )}
                {job.fieldVisibility?.experienceLevel !== false && job.experienceLevel && (
                  <span className="flex items-center gap-1.5"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> {job.experienceLevel}</span>
                )}
                {job.fieldVisibility?.workMode !== false && job.workMode && (
                  <span className="flex items-center gap-1.5"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {job.workMode}</span>
                )}
                {job.fieldVisibility?.shiftTimings !== false && job.shiftTimings && (
                  <span className="flex items-center gap-1.5"><Clock className="h-5 w-5" /> {job.shiftTimings}</span>
                )}
                {(job.fieldVisibility?.salary !== false && job.salaryVisible !== false) && job.salary && (
                  <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    ₹ {job.salary} / {job.salaryType}
                  </span>
                )}
                {job.reviewedApplicationsCount > 0 && (
                  <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                    <Users className="w-4 h-4" /> Reviewing Applications: {job.reviewedApplicationsCount}
                  </span>
                )}
                <span className="flex items-center gap-1.5"><Clock className="h-5 w-5" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
                {job.status === 'COMPLETED' ? (
                  <button 
                    disabled
                    className="bg-zinc-400 cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold shadow-sm text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Hired
                  </button>
                ) : (
                  <button 
                    onClick={hasApplied ? undefined : handleApplyClick}
                    disabled={hasApplied}
                    className={`${hasApplied ? 'bg-green-600 cursor-not-allowed' : 'bg-[#003c71] hover:bg-[#002b52]'} text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2`}
                  >
                    {hasApplied ? <><CheckCircle2 className="w-5 h-5" /> Applied</> : 'Apply Now'}
                  </button>
                )}
                <button 
                  onClick={handleSaveClick}
                  disabled={savingJob}
                  className={`bg-white border-none px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isSaved ? 'text-blue-500 hover:text-blue-600' : 'text-blue-800 hover:text-blue-800'}`}
                >
                  <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  {isSaved ? 'Saved' : 'Save Job'}
                </button>
              </div>

              {job.routeType === 'DIRECT' && job.employer?.employerProfile && (
                <div className="mb-6 p-6 bg-blue-50 border border-blue-100 rounded-xl">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" /> Employer Contact Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-800">
                    {job.employer.employerProfile.companyName && (
                      <p><span className="font-semibold text-blue-900/60 uppercase text-[10px] tracking-wider block">Company Name</span> {job.employer.employerProfile.companyName}</p>
                    )}
                    {job.employer.employerProfile.hrName && (
                      <p><span className="font-semibold text-blue-900/60 uppercase text-[10px] tracking-wider block">Contact Person</span> {job.employer.employerProfile.hrName}</p>
                    )}
                    {job.employer.employerProfile.companyWebsite && (
                      <p><span className="font-semibold text-blue-900/60 uppercase text-[10px] tracking-wider block">Website</span> <a href={job.employer.employerProfile.companyWebsite} target="_blank" className="underline">{job.employer.employerProfile.companyWebsite}</a></p>
                    )}
                    {job.employer.employerProfile.address && (
                      <p className="sm:col-span-2"><span className="font-semibold text-blue-900/60 uppercase text-[10px] tracking-wider block">Address</span> {job.employer.employerProfile.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Company Social Links */}
              <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                {job.linkedinLink?.length > 0 && (
                  <a href={job.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-[#0a66c2] transition-colors p-2 rounded-full bg-zinc-100 hover:bg-blue-50">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {job.facebookLink?.length > 0 && (
                  <a href={job.facebookLink} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-[#1877f2] transition-colors p-2 rounded-full bg-zinc-100 hover:bg-blue-50">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {job.instagramLink?.length > 0 && (
                  <a href={job.instagramLink} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-[#e4405f] transition-colors p-2 rounded-full bg-zinc-100 hover:bg-pink-50">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                <div className="ml-2">
                  <ShareButton title={job.title} text={`Check out this job: ${job.title} at SkyoConsultancy!`} url={`/jobs/${job.id}`} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-8 space-y-8">
              {job.fieldVisibility?.description !== false && (
                <section>
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">Job Description</h2>
                  <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </div>
                </section>
              )}

              {job.fieldVisibility?.requirements !== false && (
                <section>
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">Requirements & Skills</h2>
                  <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </section>
              )}

              {job.fieldVisibility?.benefits !== false && job.benefits && (
                <section>
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">Other Benefits</h2>
                  <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {job.benefits}
                  </div>
                </section>
              )}

              {job.fieldVisibility?.generalComments !== false && job.generalComments && (
                <section>
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">General Comments</h2>
                  <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {job.generalComments}
                  </div>
                </section>
              )}

              {job.skills && job.skills.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">Key Skills Needed</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="bg-zinc-100 text-zinc-800 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Bottom Apply Button */}
              <div className="pt-8 mt-8 border-t border-zinc-200">
                {job.status === 'COMPLETED' ? (
                  <button disabled className="inline-flex items-center gap-2 bg-zinc-400 text-white px-8 py-3 rounded-lg font-bold shadow-sm text-center uppercase tracking-wider text-sm cursor-not-allowed">
                    <CheckCircle2 className="w-5 h-5" /> Hired
                  </button>
                ) : hasApplied ? (
                  <button disabled className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-sm text-center uppercase tracking-wider text-sm cursor-not-allowed">
                    <CheckCircle2 className="w-5 h-5" /> Applied
                  </button>
                ) : (
                  <Link 
                    href={`/jobs/${job.id}/apply`}
                    className="inline-block bg-[#003c71] hover:bg-[#002b52] text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm text-center uppercase tracking-wider text-sm"
                  >
                    Apply For Job
                  </Link>
                )}
              </div>
            </div>
          </div>
    </>
  );
}
