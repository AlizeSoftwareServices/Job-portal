'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { Briefcase, LogOut, MapPin, Clock, ChevronRight, User, Users, FileText, Building, Save, Pencil, Upload, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
     
    

  // New Job Form State
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
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
    sessionStorage.setItem('active_portal', 'EMPLOYER');
      setLoading(false);
  }

  const fetchJobs = async (empId: string) => {
    try {
      const res = await fetch(`${API_URL}/jobs?employerId=${empId}&_t=${Date.now()}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories?_t=${Date.now()}`);
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';
import { Briefcase, LogOut, MapPin, Clock, ChevronRight, User, Users, FileText, Building, Save, Pencil, Upload, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
     
    

  // New Job Form State
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
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
    sessionStorage.setItem('active_portal', 'EMPLOYER');
      setLoading(false);
  }

  const fetchJobs = async (empId: string) => {
    try {
      const res = await fetch(`${API_URL}/jobs?employerId=${empId}&_t=${Date.now()}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories?_t=${Date.now()}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) { console.error(err); }
  };
  
  const fetchProfile = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/users/profile?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { localStorage.removeItem('skyo_auth'); localStorage.removeItem('skyo_token'); window.location.reload(); return; }
      const data = await res.json();
      if (data.employerProfile) {
        setProfile({
          ...data.employerProfile,
          primaryContactNumber: data.phone || ''
        });
      }
    } catch(err) { console.error(err); }
  };
  
  const fetchDirectApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/applications?_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { localStorage.removeItem('skyo_auth'); localStorage.removeItem('skyo_token'); window.location.reload(); return; }
      const data = await res.json();
      const appsArray = data?.items ? data.items : (Array.isArray(data) ? data : []);
      setDirectApps(appsArray.filter((a: any) => a.job?.employerId === empId && a.assignedEmployerId !== empId));
    } catch(err) { console.error(err); }
  };

  const fetchSkyoApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/applications?_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { localStorage.removeItem('skyo_auth'); localStorage.removeItem('skyo_token'); window.location.reload(); return; }
      const data = await res.json();
      const appsArray = data?.items ? data.items : (Array.isArray(data) ? data : []);
      setSkyoApps(appsArray.filter((a: any) => a.assignedEmployerId === empId));
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Real-time polling
  useEffect(() => {
    if (!employerId) return;
    
    const fetchCurrentTab = () => {
      fetchJobs(employerId);
      if (activeTab === 'direct') fetchDirectApps(employerId);
      if (activeTab === 'skyo') fetchSkyoApps(employerId);
    };

    window.addEventListener('focus', fetchCurrentTab);
    const interval = setInterval(fetchCurrentTab, 3000); // 3-second polling

    return () => {
      window.removeEventListener('focus', fetchCurrentTab);
      clearInterval(interval);
    };
  }, [employerId, activeTab]);

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('skyo_token');
    sessionStorage.removeItem('active_portal');
    router.push('/login');
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const confirmed = window.confirm("Are you sure you want to submit this Job Post Request? Once submitted, it cannot be edited.");
    if (!confirmed) return;
    if (!newJob.title?.trim()) return alert('Please enter a Job Title');
    if (!newJob.categoryId) return alert('Please select a Category');
    if (!newJob.locationCity?.trim()) return alert('Please enter Location City');
    if (!newJob.locationState?.trim()) return alert('Please enter Location State');
    if (!newJob.description?.trim()) return alert('Please enter a Description');
    if (!newJob.requirements?.trim()) return alert('Please enter Requirements');

    if (newJob.categoryId === 'NEW' && !newJob.newCategoryName?.trim()) {
      return alert('Please enter new category name');
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('skyo_token');
      
      const jobData = {
        ...newJob,
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
      if (res.status === 401) { localStorage.removeItem('skyo_auth'); localStorage.removeItem('skyo_token'); window.location.reload(); return; }
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
      alert('An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestClosure = async (jobId: string) => {
    if (!confirm('Are you sure you want to mark this job as Hired/Closed? It will be sent to the Admin for final completion.')) return;
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/jobs/${jobId}/request-closure`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { localStorage.removeItem('skyo_auth'); localStorage.removeItem('skyo_token'); window.location.reload(); return; }
      if (res.ok) {
        alert('Closure requested! The job is now marked as Completed for you, pending Admin finalization.');
        fetchJobs(employerId);
      }
    } catch (err) { console.error(err); }
  };

  const handleRepostJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to re-post this job? It will go back into Pending Approval state.')) return;
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/jobs/${jobId}/repost`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
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
                        {profile.companyLogoUrl ? (
                          <img src={`${API_URL}${profile.companyLogoUrl}`} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building className="w-8 h-8 text-sky-200" />
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
                      <>
                        <p className="text-xs text-slate-500 text-center font-medium max-w-[200px]">Click to upload company logo</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">(Max size 50KB, JPEG/PNG/JPG only)</p>
                      </>
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
                        <input type="text" value={profile.primaryContactNumber || ''} onChange={e => setProfile({...profile, primaryContactNumber: e.target.value})} className="w-full border p-2.5 rounded outline-none focus:border-amber-500" placeholder="e.g. +91 9876543210" />
                      ) : (
                        <p className="text-sm font-medium text-zinc-800 p-2.5 bg-zinc-50 rounded border border-transparent">{profile.primaryContactNumber || '-'}</p>
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
                            <a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">{profile.companyWebsite}</a>
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
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <>
              {isCreatingJob ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-sky-50 to-white px-8 py-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#003c71] flex items-center justify-center shadow-sm">
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
                              <label className="block text-sm font-bold text-sky-700 mb-1">New Category Name <span className="text-red-500">*</span></label>
                              <input type="text" required value={newJob.newCategoryName} onChange={e => setNewJob({...newJob, newCategoryName: e.target.value})} className="w-full border border-sky-300 p-2 rounded outline-none focus:border-amber-500 bg-sky-50" placeholder="e.g. Data Science" />
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
                            <select required value={newJob.locationState} onChange={e => setNewJob({...newJob, locationState: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500 bg-white">
                              <option value="" disabled>Select State</option>
                              <option value="Andhra Pradesh">Andhra Pradesh</option>
                              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                              <option value="Assam">Assam</option>
                              <option value="Bihar">Bihar</option>
                              <option value="Chhattisgarh">Chhattisgarh</option>
                              <option value="Goa">Goa</option>
                              <option value="Gujarat">Gujarat</option>
                              <option value="Haryana">Haryana</option>
                              <option value="Himachal Pradesh">Himachal Pradesh</option>
                              <option value="Jharkhand">Jharkhand</option>
                              <option value="Karnataka">Karnataka</option>
                              <option value="Kerala">Kerala</option>
                              <option value="Madhya Pradesh">Madhya Pradesh</option>
                              <option value="Maharashtra">Maharashtra</option>
                              <option value="Manipur">Manipur</option>
                              <option value="Meghalaya">Meghalaya</option>
                              <option value="Mizoram">Mizoram</option>
                              <option value="Nagaland">Nagaland</option>
                              <option value="Odisha">Odisha</option>
                              <option value="Punjab">Punjab</option>
                              <option value="Rajasthan">Rajasthan</option>
                              <option value="Sikkim">Sikkim</option>
                              <option value="Tamil Nadu">Tamil Nadu</option>
                              <option value="Telangana">Telangana</option>
                              <option value="Tripura">Tripura</option>
                              <option value="Uttar Pradesh">Uttar Pradesh</option>
                              <option value="Uttarakhand">Uttarakhand</option>
                              <option value="West Bengal">West Bengal</option>
                              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                              <option value="Chandigarh">Chandigarh</option>
                              <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                              <option value="Delhi">Delhi</option>
                              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                              <option value="Ladakh">Ladakh</option>
                              <option value="Lakshadweep">Lakshadweep</option>
                              <option value="Puducherry">Puducherry</option>
                            </select>
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
                          <button type="submit" formNoValidate disabled={isSubmitting} className={`bg-[#003c71] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#002b52] hover:shadow-lg'}`}>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</button>
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
                            <Briefcase className="h-12 w-12 text-sky-100 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No jobs found in this section.</p>
                          </div>
                        );
                      }
                      
                      return displayJobs.map(job => (
                        <div key={job.id} onClick={() => setSelectedJob(job)} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative cursor-pointer group">
                          <div className="absolute inset-0 bg-sky-50/0 group-hover:bg-sky-50/30 transition-colors rounded-3xl pointer-events-none"></div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#003c71] flex items-center justify-center shrink-0">
                                  <Briefcase className="w-4 h-4" />
                                </div>
                                <h3 className="font-black text-lg text-slate-800 leading-tight">{job.title}</h3>
                              </div>
                              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1 ml-10">
                                <MapPin className="h-4 w-4" /> {job.locationCity}, {job.locationState}
                              </p>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black shrink-0 ${
                              job.status === 'COMPLETED' ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' :
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

                          <div className="pt-4 border-t border-slate-100 ml-10 flex flex-wrap justify-between items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/> Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                            
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => handleUseTemplate(job)} className="text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors">
                                Use as Template
                              </button>
                              
                              {jobSubTab === 'active' && job.approvalStatus === 'APPROVED' && !job.closureRequested && (
                                <button onClick={() => handleRequestClosure(job.id)} className="text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition-colors">
                                  Mark as Hired
                                </button>
                              )}
                              {jobSubTab === 'completed' && job.status === 'COMPLETED' && (
                                <button onClick={() => handleRepostJob(job.id)} className="text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition-colors">
                                  Edit & Re-post
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  
                  {/* Job Details Modal */}
                  {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto" onClick={() => setSelectedJob(null)}>
                      <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="font-black text-2xl text-slate-800">{selectedJob.title}</h3>
                            <p className="text-sm text-slate-500 font-bold">{selectedJob.category?.name || selectedJob.category || 'General'} • {selectedJob.jobType}</p>
                          </div>
                          <button type="button" onClick={() => setSelectedJob(null)} className="text-sm text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg font-bold">Close</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-1">Experience</p>
                            <p className="font-medium text-slate-800">{selectedJob.experienceLevel}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-1">Vacancies</p>
                            <p className="font-medium text-slate-800">{selectedJob.vacancyCount || 'Not specified'}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-1">Location</p>
                            <p className="font-medium text-slate-800">{selectedJob.locationCity}, {selectedJob.locationState}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-1">Work Mode</p>
                            <p className="font-medium text-slate-800">{selectedJob.workMode}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-1">Salary</p>
                            <p className="font-medium text-slate-800">{selectedJob.salary ? `₹${selectedJob.salary} / ${selectedJob.salaryType}` : 'Not disclosed'}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-1">Shift Timings</p>
                            <p className="font-medium text-slate-800">{selectedJob.shiftTimings || 'Standard'}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-bold text-slate-800 mb-1">Job Description</p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedJob.description}</p>
                          </div>
                          {selectedJob.requirements && (
                            <div>
                              <p className="text-sm font-bold text-slate-800 mb-1">Requirements</p>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedJob.requirements}</p>
                            </div>
                          )}
                          {selectedJob.benefits && (
                            <div>
                              <p className="text-sm font-bold text-slate-800 mb-1">Other Benefits</p>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedJob.benefits}</p>
                            </div>
                          )}
                          {selectedJob.generalComments && (
                            <div>
                              <p className="text-sm font-bold text-slate-800 mb-1">General Comments</p>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedJob.generalComments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

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
                        <Users className="w-10 h-10 text-sky-100 mx-auto mb-3" />
                        <span className="text-slate-500 font-bold">No direct applications found.</span>
                      </td>
                    </tr>
                  ) : (
                    directApps.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {(app.firstName || app.candidate?.firstName || 'U').charAt(0)}{(app.lastName || app.candidate?.lastName || 'U').charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-800">{(app.firstName || app.candidate?.firstName || 'Unknown')} {(app.lastName || app.candidate?.lastName || '')}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-bold text-slate-700">{app.email || app.candidate?.email || 'N/A'}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{app.phone || app.candidate?.phone || 'N/A'}</p>
                        </td>
                        <td className="p-5">
                          <span className="inline-flex px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">{app.job?.title}</span>
                        </td>
                        <td className="p-5 text-sm font-medium text-slate-600">{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td className="p-5">
                          {app.resumeUrl ? (
                            <button onClick={() => window.open(app.resumeUrl.startsWith('http') ? app.resumeUrl : `${API_URL}${app.resumeUrl.replace('./uploads', '/uploads')}`, '_blank')} className="text-xs font-bold text-[#003c71] bg-sky-50 border border-sky-100 px-4 py-2 rounded-xl hover:bg-sky-100 hover:shadow-sm transition-all">
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
                        <FileText className="w-10 h-10 text-sky-100 mx-auto mb-3" />
                        <span className="text-slate-500 font-bold">No candidates passed by Admin yet.</span>
                      </td>
                    </tr>
                  ) : (
                    skyoApps.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {(app.firstName || app.candidate?.firstName || 'U').charAt(0)}{(app.lastName || app.candidate?.lastName || 'U').charAt(0)}
                            </div>
                            <span className="font-bold text-sm text-slate-800">{(app.firstName || app.candidate?.firstName || 'Unknown')} {(app.lastName || app.candidate?.lastName || '')}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-sm font-bold text-slate-700">{app.email || app.candidate?.email || 'N/A'}</p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">{app.phone || app.candidate?.phone || 'N/A'}</p>
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
