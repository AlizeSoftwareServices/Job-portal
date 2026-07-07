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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
     
    

  // New Job Form State
  const [isCreatingJob, setIsCreatingJob] = useState(false);
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
      const res = await fetch(`${API_URL}/jobs?employerId=${empId}`);
      const data = await res.json();
      setJobs(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
      setLoading(false);
  }

  const fetchJobs = async (empId: string) => {
    try {
      const res = await fetch(`${API_URL}/jobs?employerId=${empId}`);
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
      if(data.employerProfile) {
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
      const res = await fetch(`${API_URL}/applications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if(Array.isArray(data)) setDirectApps(data.filter((a: any) => a.job?.recruitmentPosition === 'DIRECT'));
    } catch(err) { console.error(err); }
  };

  const fetchSkyoApps = async (empId: string) => {
    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/applications`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if(Array.isArray(data)) setSkyoApps(data.filter((a: any) => a.job?.recruitmentPosition === 'SKYO_CONSULTANCY'));
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
    const confirmed = window.confirm("Are you sure you want to submit this Job Post Request? Once submitted, it cannot be edited.");
    if (!confirmed) return;
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
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`${API_URL}/jobs/${jobId}/request-closure`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
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
        setIsEditingProfile(false);
      } else {
        alert('Failed to update profile');
      }
    } catch(err) { console.error(err); }
  };

  if (loading || !isAuthenticated) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <div className="animate-[pulse_1.5s_ease-in-out_infinite] flex flex-col items-center">
        <img src="/logo.png" alt="Skyo Logo" className="h-28 md:h-36 w-auto object-contain mix-blend-multiply" />
        <div className="mt-8 w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full w-1/2 animate-[slideRight_1s_ease-in-out_infinite]" style={{ animation: 'slideRight 1s ease-in-out infinite alternate' }}>
            <style>{`
              @keyframes slideRight {
                0% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
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
