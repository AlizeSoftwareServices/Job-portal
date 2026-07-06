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

function ProfileContent() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://skyo-backend.onrender.com';
     
    
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'profile' | 'applied' | 'saved' | 'track' | null;
  
  const [activeTab, setActiveTab] = useState<'profile' | 'applied' | 'saved' | 'track'>('profile');

  useEffect(() => {
    if (tabParam && ['profile', 'applied', 'saved', 'track'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState<any>(null);
  
  const getPhoneMaxLength = (code: string) => {
    if (code === '+91') return 10;
    if (code === '+1') return 10;
    if (code === '+44') return 11;
    if (code === '+61') return 9;
    return 15;
  };

  useEffect(() => {
    const token = localStorage.getItem('skyo_token');
    if (!token) {
      router.push('/login');
      return;
    }

    Promise.all([
      fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`${API_URL}/applications`).then(res => res.json())
    ])
    .then(([profileData, appsData]) => {
      setProfile(profileData);
      // Just filter mock for now or use real ones if candidate ID matches
      setApplications(appsData.slice(0, 3));
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('skyo_token');
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-blue-800 animate-pulse">Loading Profile...</div>;

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
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8 flex overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max w-full">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'profile' ? 'bg-[#003c71] text-white shadow-md transform scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <User className="h-4 w-4 shrink-0" /> My Profile
            </button>
            <button 
              onClick={() => setActiveTab('applied')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'applied' ? 'bg-[#003c71] text-white shadow-md transform scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <Briefcase className="h-4 w-4 shrink-0" /> Applied Jobs
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'saved' ? 'bg-[#003c71] text-white shadow-md transform scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <Bookmark className="h-4 w-4 shrink-0" /> Saved Jobs
            </button>
            <button 
              onClick={() => setActiveTab('track')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'track' ? 'bg-[#003c71] text-white shadow-md transform scale-[1.02]' : 'text-zinc-600 hover:bg-white/60 hover:text-blue-800'}`}
            >
              <Search className="h-4 w-4 shrink-0" /> Track
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
              onSaved={() => window.location.reload()} 
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
             <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
               <Bookmark className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
               <h3 className="text-lg font-bold text-zinc-800">No saved jobs</h3>
             </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
