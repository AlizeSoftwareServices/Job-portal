'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Bookmark, ChevronRight, MapPin, Building, Search, User, Settings, Loader2, LogOut } from 'lucide-react';
import CountrySelect from '../../components/CountrySelect';
import TrackComponent from '../../components/TrackComponent';
import ProfileView from '../../components/ProfileView';
import JobCard from '../../components/JobCard';
import Navbar from '../../components/Navbar';

export default function ProfileClient({ initialProfile, initialApplications }: { initialProfile: any, initialApplications: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'profile' | 'applied' | 'saved' | 'track' | null;
  
  const [activeTab, setActiveTab] = useState<'profile' | 'applied' | 'saved' | 'track'>('profile');

  useEffect(() => {
    if (tabParam && ['profile', 'applied', 'saved', 'track'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const applications = initialApplications.slice(0, 3) || [];
  const [savedJobs, setSavedJobs] = useState<any[]>(initialProfile?.savedJobs || []);
  const [profile, setProfile] = useState<any>(initialProfile);

  useEffect(() => {
    setProfile(initialProfile);
    setSavedJobs(initialProfile?.savedJobs || []);
  }, [initialProfile]);
  
  const getPhoneMaxLength = (code: string) => {
    if (code === '+91') return 10;
    if (code === '+1') return 10;
    if (code === '+44') return 11;
    if (code === '+61') return 9;
    return 15;
  };

  useEffect(() => {
    sessionStorage.setItem('active_portal', 'CANDIDATE');

    const refreshData = () => {
      router.refresh();
    };

    window.addEventListener('focus', refreshData);
    const interval = setInterval(refreshData, 3000);

    return () => {
      window.removeEventListener('focus', refreshData);
      clearInterval(interval);
    };
  }, [router]);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch(e) {}
    localStorage.removeItem('skyo_token');
    sessionStorage.removeItem('active_portal');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <Navbar />

      {/* Premium Hero Banner */}
      <div className="w-full bg-gradient-to-r from-[#002b52] via-[#003c71] to-[#0055a4] pt-16 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Your Dashboard</h1>
            <p className="text-blue-100 font-medium text-lg">Manage your profile, track applications, and find your dream job.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        
        {/* Modern Navigation Tabs (Glassmorphic) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-1.5 md:p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8">
          <div className="grid grid-cols-4 gap-1.5 md:gap-2 w-full">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-6 md:py-3.5 rounded-xl font-bold transition-all text-[10px] sm:text-xs md:text-sm text-center ${activeTab === 'profile' ? 'bg-[#003c71] text-white shadow-md transform md:scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <User className="h-4 w-4 shrink-0" /> 
              <span className="leading-tight">My Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab('applied')}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-6 md:py-3.5 rounded-xl font-bold transition-all text-[10px] sm:text-xs md:text-sm text-center ${activeTab === 'applied' ? 'bg-[#003c71] text-white shadow-md transform md:scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <Briefcase className="h-4 w-4 shrink-0" /> 
              <span className="leading-tight">Applied Jobs</span>
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-6 md:py-3.5 rounded-xl font-bold transition-all text-[10px] sm:text-xs md:text-sm text-center ${activeTab === 'saved' ? 'bg-[#003c71] text-white shadow-md transform md:scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <Bookmark className="h-4 w-4 shrink-0" /> 
              <span className="leading-tight">Saved Jobs</span>
            </button>
            <button 
              onClick={() => setActiveTab('track')}
              className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 p-2 md:px-6 md:py-3.5 rounded-xl font-bold transition-all text-[10px] sm:text-xs md:text-sm text-center ${activeTab === 'track' ? 'bg-[#003c71] text-white shadow-md transform md:scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <Search className="h-4 w-4 shrink-0" /> 
              <span className="leading-tight">Track</span>
            </button>
          </div>
        </div>

        <main className="w-full">
          {activeTab !== 'profile' && (
            <h1 className="text-3xl font-bold text-zinc-900 mb-8 capitalize">
              {activeTab === 'track' ? 'Track Application' : 
               activeTab === 'applied' ? 'Applied Jobs' :
               activeTab === 'saved' ? 'Saved Jobs' : ''}
            </h1>
          )}

          {activeTab === 'track' && (
            <TrackComponent />
          )}

          {activeTab === 'profile' && (
            <ProfileView 
              profile={profile} 
              onSaved={(updatedProfile) => {
                if (updatedProfile) {
                  setProfile({ ...updatedProfile, savedJobs: updatedProfile.savedJobs || [] });
                } else {
                  window.location.reload();
                }
              }} 
            />
          )}

          {activeTab === 'applied' && (
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
                  <Briefcase className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-zinc-800">No applications yet</h3>
                  <Link href="/jobs" className="mt-4 inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Find Jobs</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {applications.map((app) => (
                    <JobCard key={app.id} job={app.job || { title: 'General Registration', locationCity: 'SkyoConsultancy', locationState: 'Platform' }} showAppliedBadge={true} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
             <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8">
               <h2 className="text-2xl font-black text-zinc-900 mb-6">Saved Jobs</h2>
               {savedJobs.length === 0 ? (
                 <div className="text-center py-16 bg-zinc-50 rounded-xl border border-zinc-100">
                   <Bookmark className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                   <h3 className="text-lg font-bold text-zinc-800">No saved jobs</h3>
                   <p className="text-zinc-500 mt-2 max-w-sm mx-auto">Jobs you save will appear here. Find jobs you are interested in and click the save button.</p>
                   <Link href="/jobs" className="mt-4 inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">Find Jobs</Link>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                   {savedJobs.map((saved) => (
                     <JobCard key={saved.id} job={saved.job} />
                   ))}
                 </div>
               )}
             </div>
          )}

        </main>
      </div>
    </div>
  );
}

