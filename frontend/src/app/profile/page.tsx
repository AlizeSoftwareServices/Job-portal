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
      fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/applications`).then(res => res.json())
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
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('skyo_token');
      router.push('/login');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-blue-800 animate-pulse">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Horizontal Navigation */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-2 shadow-sm mb-8">
          <div className="grid grid-cols-2 md:flex gap-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center md:justify-start gap-1.5 px-2 sm:px-5 py-2.5 rounded-xl font-bold transition-colors text-xs sm:text-sm ${activeTab === 'profile' ? 'bg-blue-800 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              <User className="h-4 w-4 shrink-0" /> <span className="truncate">My Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab('applied')}
              className={`flex items-center justify-center md:justify-start gap-1.5 px-2 sm:px-5 py-2.5 rounded-xl font-bold transition-colors text-xs sm:text-sm ${activeTab === 'applied' ? 'bg-blue-800 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              <Briefcase className="h-4 w-4 shrink-0" /> <span className="truncate">Applied Jobs</span>
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`flex items-center justify-center md:justify-start gap-1.5 px-2 sm:px-5 py-2.5 rounded-xl font-bold transition-colors text-xs sm:text-sm ${activeTab === 'saved' ? 'bg-blue-800 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              <Bookmark className="h-4 w-4 shrink-0" /> <span className="truncate">Saved Jobs</span>
            </button>
            <button 
              onClick={() => setActiveTab('track')}
              className={`flex items-center justify-center md:justify-start gap-1.5 px-2 sm:px-5 py-2.5 rounded-xl font-bold transition-colors text-xs sm:text-sm ${activeTab === 'track' ? 'bg-blue-800 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-50'}`}
            >
              <Search className="h-4 w-4 shrink-0" /> <span className="truncate">Track</span>
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
