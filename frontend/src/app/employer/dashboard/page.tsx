'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { Briefcase, LogOut, MapPin, Clock, ChevronRight, User, Users, FileText, Building, Save, Pencil, Upload, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function EmployerDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employerId, setEmployerId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [directApps, setDirectApps] = useState<any[]>([]);
  const [skyoApps, setSkyoApps] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState('profile'); // profile, jobs, direct, skyo
  const [jobSubTab, setJobSubTab] = useState<'active'|'completed'>('active');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://skyo-backend.onrender.com';
     
    

  // New Job Form State
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const defaultJobState = {
    title: '',
    categoryId: '',
    newCategoryName: '',
    locationCity: '',
    locationState: '',
    experienceLevel: 'Entry Level',
    workMode: 'Remote',
    jobType: 'Permanent',
    description: '',
    requirements: '',
    salary: '',
    salaryType: 'Month',
    salaryVisible: true,
    vacancyCount: '1',
    shiftTimings: '',
    benefits: '',
    generalComments: '',
    facebookLink: '',
    instagramLink: '',
    linkedinLink: '',
  };
  const [newJob, setNewJob] = useState(defaultJobState);

  const checkAuth = () => {
    const token = localStorage.getItem('skyo_token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.role !== 'EMPLOYER') {
        router.push('/');
        return;
      }
      setEmployerId(decoded.sub);
      setIsAuthenticated(true);
      fetchData(decoded.sub);
    } catch (error) {
      localStorage.removeItem('skyo_token');
      router.push('/login');
    }
  };

  const fetchData = async (empId: string) => {
    setLoading(true);
    await Promise.all([
      fetchJobs(empId),
      fetchCategories(),
      fetchProfile(empId),
      fetchDirectApps(empId),
      fetchSkyoApps(empId)
    ]);
    setLoading(false);
  }

  const fetchJobs = async (empId: string) => {
    try {
      const res = await fetch(`${API_URL}/jobs/employer/${empId}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) { console.error(err); }
  };
  
  const fetchProfile = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile({
        companyName: data.employerProfile?.companyName || '',
        primaryContactNumber: data.phone || '',
        secondaryContactNumber: data.employerProfile?.secondaryContactNumber || '',
        industry: data.employerProfile?.industry || '',
        companyLocation: data.employerProfile?.companyLocation || '',
        hrName: data.employerProfile?.hrName || '',
        hrContactNumber: data.employerProfile?.hrContactNumber || '',
        officialMailId: data.employerProfile?.officialMailId || '',
        companyWebsite: data.employerProfile?.companyWebsite || '',
      });
    } catch(err) { console.error(err); }
  };
  
  const fetchDirectApps = async (empId: string) => {
    try {
      const res = await fetch(`${API_URL}/applications/employer/${empId}/direct`);
      const data = await res.json();
      setDirectApps(data);
    } catch(err) { console.error(err); }
  };

  const fetchSkyoApps = async (empId: string) => {
    try {
      const res = await fetch(`${API_URL}/applications/employer/${empId}/skyo`);
      const data = await res.json();
      setSkyoApps(data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('skyo_token');
    router.push('/login');
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title?.trim()) return alert('Please enter a Job Title');
    if (!newJob.categoryId) return alert('Please select a Category');
    if (!newJob.locationCity?.trim()) return alert('Please enter Location City');
    if (!newJob.locationState?.trim()) return alert('Please enter Location State');
    if (!newJob.description?.trim()) return alert('Please enter a Description');
    if (!newJob.requirements?.trim()) return alert('Please enter Requirements');

    try {
      const token = localStorage.getItem('skyo_token');
      
      let finalCategoryId = newJob.categoryId;
      if (newJob.categoryId === 'NEW') {
        if (!newJob.newCategoryName.trim()) return alert('Please enter new category name');
      }

      if (newJob.newCategoryName.trim() !== '') {
        const catRes = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newJob.newCategoryName.trim() })
        });
        const catData = await catRes.json();
        finalCategoryId = catData.id;
      }

      const jobData = {
        ...newJob,
        categoryId: finalCategoryId,
        employerId,
        vacancyCount: Number(newJob.vacancyCount) || 1
      };

      const res = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(jobData) 
      });
      if (res.ok) {
        alert('Job Posted successfully! It is now pending admin approval.');
        setIsCreatingJob(false);
        setNewJob(defaultJobState);
        fetchJobs(employerId);
      } else {
        alert('Failed to save job.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestClosure = async (jobId: string) => {
    if (!confirm('Are you sure you want to mark this job as Hired/Closed? It will be sent to the Admin for final completion.')) return;
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}/request-closure`, { method: 'PUT' });
      if (res.ok) {
        alert('Closure requested! The job is now marked as Completed for you, pending Admin finalization.');
        fetchJobs(employerId);
      }
    } catch (err) { console.error(err); }
  };

  const handleRepostJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to re-post this job? It will go back into Pending Approval state.')) return;
    try {
      const res = await fetch(`${API_URL}/jobs/${jobId}/repost`, { method: 'PUT' });
      if (res.ok) {
        alert('Job re-posted successfully!');
        fetchJobs(employerId);
      }
    } catch (err) { console.error(err); }
  };

  const isProfileComplete = () => {
    return profile.companyName?.trim() && 
           profile.primaryContactNumber?.trim() && 
           profile.industry?.trim() && 
           profile.companyLocation?.trim() && 
           profile.hrName?.trim() && 
           profile.officialMailId?.trim();
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert('Avatar size too large before compression.');
      e.target.value = '';
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert('Only JPEG, JPG, and PNG files are allowed.');
      e.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    
    try {
      const options = { maxSizeMB: 0.05, maxWidthOrHeight: 800, useWebWorker: true };
      // @ts-ignore
      const compressedFile = await imageCompression(file, options);
      
      const data = new FormData();
      data.append('file', compressedFile);
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/users/profile/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });
      if (res.ok) {
        const body = await res.json();
        setProfile({ ...profile, avatarUrl: body.avatarUrl });
      } else {
        alert('Failed to upload avatar');
      }
    } catch(err) {
      console.error(err);
      alert('Error uploading avatar');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch(err) { console.error(err); }
  };

  if (loading || !isAuthenticated) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Portal...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 w-64 bg-[#0B132B] text-slate-300 flex flex-col h-full z-[70] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 pt-6 pb-4 flex flex-col items-center justify-center relative">
          <button className="md:hidden absolute top-4 right-4 text-zinc-400 p-1 bg-zinc-800 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
          <a href="/" className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center">
            <img src="/logo.png" alt="Skyo Logo" className="h-12 md:h-16 w-auto object-contain mb-2" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Employer Portal</span>
          </a>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => { setActiveTab('profile'); setIsCreatingJob(false); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'profile' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800'}`}>
            <User className="h-5 w-5" /> Profile Settings
          </button>
          <button onClick={() => { setActiveTab('jobs'); setIsCreatingJob(false); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'jobs' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800'}`}>
            <Briefcase className="h-5 w-5" /> Manage Jobs
          </button>
          <button onClick={() => { setActiveTab('direct_applicants'); setIsCreatingJob(false); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'direct_applicants' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800'}`}>
            <Users className="h-5 w-5" /> Direct Applicants
          </button>
          <button onClick={() => { setActiveTab('skyo_applicants'); setIsCreatingJob(false); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'skyo_applicants' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800'}`}>
            <FileText className="h-5 w-5" /> Skyo Applicants
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-3 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50 w-full">
        <header className="bg-white/80 backdrop-blur-md h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 shrink-0 sticky top-0 z-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-zinc-600" onClick={() => setIsMobileMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 capitalize tracking-tight">{activeTab.replace('_', ' ')}</h1>
          </div>
          {activeTab === 'jobs' && !isCreatingJob && (
             <button 
               onClick={() => {
                 if (!isProfileComplete()) {
                   alert('Please complete your Company Profile Information (including Company Name, Contact, Industry, Location, HR Name, and Official Mail ID) before posting a new job.');
                   setActiveTab('profile');
                   setIsEditingProfile(true);
                   return;
                 }
                 setIsCreatingJob(true);
               }} 
               className="bg-[#003c71] text-white font-bold py-2.5 px-6 rounded-xl hover:bg-[#002b52] hover:shadow-lg hover:shadow-blue-900/20 transition-all flex items-center gap-2 transform hover:scale-[1.02]"
             >
               <Briefcase className="w-4 h-4" /> Post New Job
             </button>
          )}
          {activeTab === 'profile' && (
            <div className="flex items-center gap-4">
              {!isEditingProfile ? (
                <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 bg-blue-50 hover:bg-[#003c71] text-blue-800 hover:text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md">
                  <Pencil className="w-4 h-4" /> Edit Profile
                </button>
              ) : null}
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8 max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-slate-50 to-white px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003c71] flex items-center justify-center shadow-sm">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Company Profile Information</h3>
                  <p className="text-sm text-slate-500 font-medium">Manage your organization's details</p>
                </div>
              </div>
              <div className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Company Logo Upload */}
                  <div className="flex flex-col items-center mb-6 pb-6 border-b border-zinc-100">
                    <div className="relative group mb-3">
                      <div className="w-24 h-24 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-zinc-300">
                        {profile.avatarUrl ? (
                          <img src={`${API_URL}${profile.avatarUrl}`} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-8 h-8 text-zinc-400" />
                        )}
                      </div>
                      {isEditingProfile && (
                        <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Upload className="w-6 h-6 text-white" />
                          <input type="file" ref={avatarInputRef} className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        </label>
                      )}
                    </div>
                    {isEditingProfile && (
                      <p className="text-xs text-zinc-500 font-medium">Click to upload company logo (Optional)</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Company Name</label>
                      {isEditingProfile ? (
                        <input type="text" value={profile.companyName || ''} onChange={e => setProfile({...profile, companyName: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="e.g. Acme Corp" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.companyName || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Primary Contact Number</label>
                      {isEditingProfile ? (
                        <input type="text" value={profile.primaryContactNumber || ''} onChange={e => setProfile({...profile, primaryContactNumber: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500 bg-zinc-100" placeholder="e.g. +91 9876543210" disabled title="Primary contact number is managed from Account Settings" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.primaryContactNumber || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Secondary Contact Number</label>
                      {isEditingProfile ? (
                        <input type="text" value={profile.secondaryContactNumber || ''} onChange={e => setProfile({...profile, secondaryContactNumber: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="e.g. +91 9876543210" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.secondaryContactNumber || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Industry Type</label>
                      {isEditingProfile ? (
                        <input type="text" value={profile.industry || ''} onChange={e => setProfile({...profile, industry: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="e.g. Information Technology" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.industry || '-'}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Company Location</label>
                      {isEditingProfile ? (
                        <textarea value={profile.companyLocation || ''} onChange={e => setProfile({...profile, companyLocation: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" rows={2} placeholder="Full address of the company"></textarea>
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.companyLocation || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">HR Name</label>
                      {isEditingProfile ? (
                        <input type="text" value={profile.hrName || ''} onChange={e => setProfile({...profile, hrName: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="e.g. Jane Doe" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.hrName || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">HR Contact Number</label>
                      {isEditingProfile ? (
                        <input type="text" value={profile.hrContactNumber || ''} onChange={e => setProfile({...profile, hrContactNumber: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="e.g. +91 8765432109" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.hrContactNumber || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Official Mail id</label>
                      {isEditingProfile ? (
                        <input type="email" value={profile.officialMailId || ''} onChange={e => setProfile({...profile, officialMailId: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="hr@acmecorp.com" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.officialMailId || '-'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-1">Company Website</label>
                      {isEditingProfile ? (
                        <input type="url" value={profile.companyWebsite || ''} onChange={e => setProfile({...profile, companyWebsite: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="https://..." />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">
                          {profile.companyWebsite ? (
                            <a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.companyWebsite}</a>
                          ) : '-'}
                        </p>
                      )}
                    </div>
                  </div>
                  {isEditingProfile && (
                    <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-8 py-3 rounded-xl font-bold transition-all shadow-sm">
                        <X className="w-5 h-5" /> Cancel
                      </button>
                      <button type="submit" className="bg-[#003c71] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#002b52] hover:shadow-lg transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Profile
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <>
              {isCreatingJob ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-white px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003c71] flex items-center justify-center shadow-sm">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Create New Job Posting</h3>
                      <p className="text-sm text-slate-500 font-medium">Fill in the details below to publish a new opening</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleSaveJob}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                            <input required type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Frontend Developer" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Category <span className="text-red-500">*</span></label>
                            <select required value={newJob.categoryId} onChange={e => setNewJob({...newJob, categoryId: e.target.value, newCategoryName: ''})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                              <option value="" disabled>Select Category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              <option value="NEW">Others (Type manually)</option>
                            </select>
                          </div>
                          
                          {newJob.categoryId === 'NEW' && (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-bold text-blue-700 mb-1">New Category Name <span className="text-red-500">*</span></label>
                              <input type="text" required value={newJob.newCategoryName} onChange={e => setNewJob({...newJob, newCategoryName: e.target.value})} className="w-full border border-blue-300 p-2 rounded outline-none focus:border-amber-500 bg-blue-50" placeholder="e.g. Data Science" />
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">No. Of. Vacancies</label>
                            <input type="text" value={newJob.vacancyCount} onChange={e => setNewJob({...newJob, vacancyCount: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. 10" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Location City <span className="text-red-500">*</span></label>
                            <input required type="text" value={newJob.locationCity} onChange={e => setNewJob({...newJob, locationCity: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Chennai" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Location State <span className="text-red-500">*</span></label>
                            <input required type="text" value={newJob.locationState} onChange={e => setNewJob({...newJob, locationState: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Tamil Nadu" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Job Type <span className="text-red-500">*</span></label>
                            <select required value={newJob.jobType} onChange={e => setNewJob({...newJob, jobType: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                              <option value="Permanent">Permanent</option>
                              <option value="Temporary">Temporary</option>
                              <option value="Contract">Contract</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Work Mode <span className="text-red-500">*</span></label>
                            <select required value={newJob.workMode} onChange={e => setNewJob({...newJob, workMode: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                              <option value="Remote">Remote</option>
                              <option value="Onsite">Onsite</option>
                              <option value="Hybrid">Hybrid</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Shift Timings</label>
                            <select value={newJob.shiftTimings} onChange={e => setNewJob({...newJob, shiftTimings: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                              <option value="">Select Shift Timing</option>
                              <option value="9:00 AM-6:00 PM (General shift)">9:00 AM-6:00 PM (General shift)</option>
                              <option value="6:00 PM-3:00 AM IST(US shift)">6:00 PM-3:00 AM IST(US shift)</option>
                              <option value="1:30 PM-10:30PM IST(UK shift)">1:30 PM-10:30PM IST(UK shift)</option>
                              <option value="5:30AM-2:30 PM IST (Australia shift)">5:30AM-2:30 PM IST (Australia shift)</option>
                              <option value="Rotational shift-Weekly changes">Rotational shift-Weekly changes</option>
                              <option value="Flexible timings (Candidate can choose 8-Hr slot)">Flexible timings (Candidate can choose 8-Hr slot)</option>
                              <option value="6:00AM-2:00PM (Morning shift)">6:00AM-2:00PM (Morning shift)</option>
                              <option value="2:00PM-10:00PM (Day shift)">2:00PM-10:00PM (Day shift)</option>
                              <option value="10:00PM-6:00 PM (Night Shift)">10:00PM-6:00 PM (Night Shift)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Experience Level <span className="text-red-500">*</span></label>
                            <select required value={newJob.experienceLevel} onChange={e => setNewJob({...newJob, experienceLevel: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                              <option value="Entry Level">Entry Level</option>
                              <option value="Mid Level">Mid Level</option>
                              <option value="Senior Level">Senior Level</option>
                              <option value="Executive">Executive</option>
                            </select>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-zinc-700 mb-1">Salary</label>
                              <input type="text" value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. ₹30,000" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-bold text-zinc-700 mb-1">Per</label>
                              <select value={newJob.salaryType} onChange={e => setNewJob({...newJob, salaryType: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                                <option value="Month">Month</option>
                                <option value="Year">Year</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Other Benefits</label>
                            <textarea value={newJob.benefits} onChange={e => setNewJob({...newJob, benefits: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={2}></textarea>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-zinc-700 mb-1">General Comments</label>
                            <textarea value={newJob.generalComments} onChange={e => setNewJob({...newJob, generalComments: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={2}></textarea>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Description <span className="text-red-500">*</span></label>
                            <textarea required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={3}></textarea>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Requirements <span className="text-red-500">*</span></label>
                            <textarea required value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={3}></textarea>
                          </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
                          <button type="button" onClick={() => { setNewJob(defaultJobState); setIsCreatingJob(false); }} className="px-8 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                          <button type="submit" formNoValidate className="bg-[#003c71] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#002b52] shadow-md hover:shadow-lg transition-all">Submit for Approval</button>
                        </div>
                      </form>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
                    <button onClick={() => setJobSubTab('active')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${jobSubTab === 'active' ? 'bg-[#003c71] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Active Jobs</button>
                    <button onClick={() => setJobSubTab('completed')} className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${jobSubTab === 'completed' ? 'bg-[#003c71] text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Completed Jobs</button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(() => {
                      const activeJobs = jobs.filter(j => !j.closureRequested && j.status !== 'COMPLETED');
                      const completedJobs = jobs.filter(j => j.closureRequested || j.status === 'COMPLETED');
                      const displayJobs = jobSubTab === 'active' ? activeJobs : completedJobs;
                      
                      if (displayJobs.length === 0) {
                        return (
                          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
                            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No jobs found in this section.</p>
                          </div>
                        );
                      }
                      
                      return displayJobs.map(job => (
                        <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003c71] flex items-center justify-center shrink-0">
                                  <Briefcase className="w-4 h-4" />
                                </div>
                                <h3 className="font-black text-lg text-slate-800 leading-tight">{job.title}</h3>
                              </div>
                              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1 ml-10">
                                <MapPin className="h-4 w-4" /> {job.locationCity}, {job.locationState}
                              </p>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black shrink-0 ${
                              job.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                              job.closureRequested ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                              job.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                              job.approvalStatus === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                              'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {job.status === 'COMPLETED' ? 'COMPLETED' : job.closureRequested ? 'CLOSURE REQUESTED' : job.approvalStatus.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-xs font-bold mb-5 ml-10">
                            <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">{job.jobType}</span>
                            <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">{job.experienceLevel}</span>
                          </div>

                          <div className="pt-4 border-t border-slate-100 ml-10 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/> Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                            
                            {jobSubTab === 'active' && job.approvalStatus === 'APPROVED' && !job.closureRequested && (
                              <button onClick={() => handleRequestClosure(job.id)} className="text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition-colors">
                                Mark as Hired
                              </button>
                            )}
                            {jobSubTab === 'completed' && job.status === 'COMPLETED' && (
                              <button onClick={() => handleRepostJob(job.id)} className="text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">
                                Edit & Re-post
                              </button>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </>
              )}
            </>
          )}

          {/* DIRECT APPLICANTS TAB */}
          {activeTab === 'direct_applicants' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Applicant Name</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Contact</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Job Role</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Date Applied</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {directApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <span className="text-slate-500 font-bold">No direct applications found.</span>
                      </td>
                    </tr>
                  ) : (
                    directApps.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {app.firstName.charAt(0)}{app.lastName.charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-800">{app.firstName} {app.lastName}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-bold text-slate-700">{app.email}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{app.phone}</p>
                        </td>
                        <td className="p-5">
                          <span className="inline-flex px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">{app.job?.title}</span>
                        </td>
                        <td className="p-5 text-sm font-medium text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td className="p-5">
                          {app.resumeUrl ? (
                            <button onClick={() => window.open(app.resumeUrl.startsWith('http') ? app.resumeUrl : `${API_URL}${app.resumeUrl.replace('./uploads', '/uploads')}`, '_blank')} className="text-xs font-bold text-[#003c71] bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-100 hover:shadow-sm transition-all">
                              View Resume
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">No Resume</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SKYO APPLICANTS TAB */}
          {activeTab === 'skyo_applicants' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Applicant Name</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Contact</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Job Role</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Date Passed</th>
                    <th className="p-5 font-bold text-xs uppercase tracking-wider text-slate-500">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {skyoApps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <span className="text-slate-500 font-bold">No candidates passed by Admin yet.</span>
                      </td>
                    </tr>
                  ) : (
                    skyoApps.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {app.firstName.charAt(0)}{app.lastName.charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-800">{app.firstName} {app.lastName}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-bold text-slate-700">{app.email}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{app.phone}</p>
                        </td>
                        <td className="p-5">
                          <span className="inline-flex px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">{app.job?.title}</span>
                        </td>
                        <td className="p-5 text-sm font-medium text-slate-600">{new Date(app.updatedAt).toLocaleDateString()}</td>
                        <td className="p-5">
                          {app.resumeUrl ? (
                            <button onClick={() => window.open(app.resumeUrl.startsWith('http') ? app.resumeUrl : `${API_URL}${app.resumeUrl.replace('./uploads', '/uploads')}`, '_blank')} className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl hover:bg-emerald-100 hover:shadow-sm transition-all">
                              View Resume
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">No Resume</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
