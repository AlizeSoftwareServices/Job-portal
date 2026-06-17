'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShareButton from '../../../components/ShareButton';
import Footer from '../../../components/Footer';
import { MapPin, Briefcase, Clock, Building, ArrowLeft, UploadCloud, CheckCircle2, Share2, Users } from 'lucide-react';
import AuthButtons from '../../../components/AuthButtons';
import ProfileLink from '../../../components/ProfileLink';
import Navbar from '../../../components/Navbar';

export default function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        setJob(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    const token = localStorage.getItem('skyo_token');
    if (token) {
      fetch('http://localhost:3000/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(profile => {
        if (profile.applications) {
          const applied = profile.applications.some((app: any) => app.jobId === jobId);
          setHasApplied(applied);
        }
      })
      .catch(console.error);
    }
  }, [jobId]);

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('skyo_token');
    if (!token) {
      router.push('/login');
    } else {
      router.push(`/jobs/${job.id}/apply`);
    }
  };

  const handleSaveClick = () => {
    const token = localStorage.getItem('skyo_token');
    if (!token) {
      router.push('/login');
    } else {
      alert('Job saved to your profile!');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Job Details Content */}
      <main className="max-w-4xl w-full mx-auto px-6 mb-16">
        {/* Back Button */}
        <div className="pt-8 pb-4">
          <Link href="/jobs" className="inline-flex items-center text-blue-800 hover:text-blue-800 font-bold transition-colors w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
          </Link>
        </div>
        {loading ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 shadow-sm animate-pulse">
            Loading job details...
          </div>
        ) : !job ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center text-zinc-500 shadow-sm">
            Job not found or has been removed.
          </div>
        ) : (
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
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{job.category}</span>
                    <span className="inline-block bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{job.jobCode}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-zinc-600 mb-6 text-sm sm:text-base mt-4">
                <span className="flex items-center gap-1.5"><Building className="h-5 w-5" /> SkyoConsultancy Platform</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-5 w-5" /> {job.locationCity}, {job.locationState}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-5 w-5" /> {job.jobType}</span>
                {job.salaryVisible !== false && job.salary && (
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
                <button 
                  onClick={hasApplied ? undefined : handleApplyClick}
                  disabled={hasApplied}
                  className={`${hasApplied ? 'bg-green-600 cursor-not-allowed' : 'bg-[#003c71] hover:bg-[#002b52]'} text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2`}
                >
                  {hasApplied ? <><CheckCircle2 className="w-5 h-5" /> Applied</> : 'Apply Now'}
                </button>
                <button 
                  onClick={handleSaveClick}
                  className="bg-white border-none text-blue-800 hover:text-blue-800 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  Save Job
                </button>
              </div>

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
              <section>
                <h2 className="text-xl font-bold text-zinc-900 mb-4">Job Description</h2>
                <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-zinc-900 mb-4">Requirements & Skills</h2>
                <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </section>

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
                {hasApplied ? (
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
        )}
      </main>

      <div className="mt-auto">

      {/* The inline modal was removed to use the dedicated Adecco-style /apply page */}
      <Footer />
      </div>
    </div>
  );
}
