'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Users, Layers, TrendingUp, Settings, LogOut, Search, Bell, Menu, MapPin, Clock, ChevronRight, Eye, EyeOff, Trash2, Edit, Save, X, Upload, Download, Building2, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import RelationalFlowChart from '@/components/RelationalFlowChart';

export default function AdminDashboard() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminAuthChecked, setAdminAuthChecked] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

    const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('skyo_admin_token', data.token);
        localStorage.setItem('skyo_admin_auth', 'true');
        setIsAdminAuthenticated(true);
      sessionStorage.setItem('active_portal', 'ADMIN');
        window.location.reload();
      } else {
        alert('Invalid username or password');
      }
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleAdminLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('skyo_admin_auth');
    localStorage.removeItem('skyo_admin_token');
    setIsAdminAuthenticated(false);
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'categories' | 'applications' | 'employers'>('dashboard');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employersList, setEmployersList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalJobs: 0, activeJobs: 0, completedJobs: 0 });
  const [jobToConfirmStatus, setJobToConfirmStatus] = useState<{id: string, currentStatus: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [jobRouteTypes, setJobRouteTypes] = useState<Record<string, string>>({});

  // Application Details Modal State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [isReInvite, setIsReInvite] = useState(false);
  const [reInviteJobId, setReInviteJobId] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [appEmployerSelections, setAppEmployerSelections] = useState<Record<string, string>>({});

  // New Job Form State
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
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
    recruitmentPosition: '',
    vacancyCount: 1,
    shiftTimings: '',
    benefits: '',
    generalComments: '',
    facebookLink: '',
    instagramLink: '',
    linkedinLink: '',
    status: 'ACTIVE',
    fieldVisibility: {} as Record<string, boolean>
  };
  const [newJob, setNewJob] = useState(defaultJobState);

  const [newCategory, setNewCategory] = useState({ name: '', imageUrl: '' });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingCategoryImage, setEditingCategoryImage] = useState('');

  const [jobCategoryFilter, setJobCategoryFilter] = useState('All');
  const [jobLocationFilter, setJobLocationFilter] = useState('All');
  const [jobStatusFilter, setJobStatusFilter] = useState('All');

  // Filters for Applications
  const [appCategoryFilter, setAppCategoryFilter] = useState('All');
  const [appJobFilter, setAppJobFilter] = useState('All');
  const [appLocationFilter, setAppLocationFilter] = useState('All');
  const [appStatusFilter, setAppStatusFilter] = useState('All');
  
  // State for Employers UI
  const [expandedEmployerId, setExpandedEmployerId] = useState<string | null>(null);
  
  // Pagination for Applications
  const [appCurrentPage, setAppCurrentPage] = useState(1);
  const appsPerPage = 16;

  // Pagination for Jobs
  const [jobCurrentPage, setJobCurrentPage] = useState(1);
  const jobsPerPage = 16;

  // Derive filter options for Applications
  const appUniqueCategories = ['All', ...Array.from(new Set(applications.map((a: any) => a.job?.category?.name || 'General')))] as string[];
  const appUniqueJobs = ['All', ...Array.from(new Set(applications.map((a: any) => a.job?.title).filter(Boolean)))] as string[];
  const appUniqueLocations = ['All', ...Array.from(new Set(applications.map((a: any) => {
    return a.job ? `${a.job.locationCity}, ${a.job.locationState}` : null;
  }).filter(Boolean)))] as string[];
  const appUniqueStatuses = ['All', ...Array.from(new Set(applications.map((a: any) => a.status || 'APPLIED')))] as string[];

  const toggleVisibility = (field: string) => {
    setNewJob(prev => ({
      ...prev,
      fieldVisibility: {
        ...prev.fieldVisibility,
        [field]: prev.fieldVisibility[field] === false ? true : false
      }
    }));
  };

  const FieldToggle = ({ field }: { field: string }) => {
    const isVisible = newJob.fieldVisibility[field] !== false;
    return (
      <button 
        type="button" 
        onClick={() => toggleVisibility(field)} 
        className={`p-1.5 rounded-md transition-colors ${isVisible ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
        title={isVisible ? 'Field is Visible' : 'Field is Hidden'}
      >
        {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    );
  };

  // Filter and paginate Applications
  const filteredApplications = applications.filter((app: any) => {
    const catName = app.job?.category?.name || 'General';
    const categoryMatch = appCategoryFilter === 'All' || catName === appCategoryFilter;
    
    const jobMatch = appJobFilter === 'All' || app.job?.title === appJobFilter;
    
    const locationStr = app.job ? `${app.job.locationCity || ''}, ${app.job.locationState || ''}` : '';
    const locationMatch = appLocationFilter === 'All' || locationStr === appLocationFilter;
    
    const statusMatch = appStatusFilter === 'All' || app.status === appStatusFilter;
    
    return categoryMatch && jobMatch && locationMatch && statusMatch;
  });

  const indexOfLastApp = appCurrentPage * appsPerPage;
  const indexOfFirstApp = indexOfLastApp - appsPerPage;
  const currentApps = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalAppPages = Math.ceil(filteredApplications.length / appsPerPage);

  // Reset pagination when application filters change
  useEffect(() => {
    setAppCurrentPage(1);
  }, [appCategoryFilter, appJobFilter, appLocationFilter, appStatusFilter]);

  // Reset pagination when job filters change
  useEffect(() => {
    setJobCurrentPage(1);
  }, [jobCategoryFilter, jobLocationFilter, jobStatusFilter]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
     
    

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/admin-all`, { headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
      const data = await res.json();
      if(Array.isArray(data)) setJobs(data);
    } catch (err) { console.error(err); }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/applications`, { headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
      const data = await res.json();
      if(Array.isArray(data)) setApplications(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, { headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
      const data = await res.json();
      if(Array.isArray(data)) setCategories(data);
    } catch (err) { console.error(err); }
  };

  const fetchEmployersList = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/employers`, { headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
      const data = await res.json();
      if(Array.isArray(data)) setEmployersList(data);
    } catch (err) { console.error(err); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/dashboard-data`, { headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
      if (!res.ok) {
        throw new Error('Stats fetch failed');
      }
      const data = await res.json();
      setStats(data);
    } catch (err) { 
      console.error(err); 
      setStats({ totalJobs: 0, activeJobs: 0, totalApplications: 0, categoryBreakdown: [] });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('skyo_admin_token');
    if (localStorage.getItem('skyo_admin_auth') === 'true' && token) {
      setIsAdminAuthenticated(true);
      Promise.all([fetchJobs(), fetchApplications(), fetchCategories(), fetchEmployersList(), fetchStats()]).then(() => setLoading(false));
    } else {
      localStorage.removeItem('skyo_admin_auth');
      localStorage.removeItem('skyo_admin_token');
      setIsAdminAuthenticated(false);
      setLoading(false);
    }
    setAdminAuthChecked(true);
  }, []);

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title?.trim()) return alert('Please scroll up and enter a Job Title');
    if (!newJob.categoryId) return alert('Please scroll up and select a Category');
    if (newJob.categoryId === 'NEW' && !newJob.newCategoryName?.trim()) return alert('Please scroll up and enter the New Category Name');
    if (!newJob.locationCity?.trim()) return alert('Please scroll up and enter Location City');
    if (!newJob.locationState?.trim()) return alert('Please scroll up and enter Location State');
    if (!newJob.salary?.trim()) return alert('Please enter Salary Amount');
    if (!newJob.description?.trim()) return alert('Please enter a Description');
    if (!newJob.requirements?.trim()) return alert('Please enter Requirements');

    try {
      let finalCategoryId = newJob.categoryId;
      // If user provided a new category name, create it first
      if (newJob.newCategoryName.trim() !== '') {
        const catRes = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
          body: JSON.stringify({ name: newJob.newCategoryName.trim() })
        });
        const catData = await catRes.json();
        finalCategoryId = catData.id;
      }

      const method = editingJobId ? 'PUT' : 'POST';
      const url = editingJobId 
        ? `${API_URL}/jobs/${editingJobId}`
        : `${API_URL}/jobs`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ ...newJob, categoryId: finalCategoryId, vacancyCount: Number(newJob.vacancyCount) || 1 }) 
      });
      if (res.ok) {
        alert(editingJobId ? 'Job Updated successfully!' : 'Job Created successfully!');
        setIsCreatingJob(false);
        setEditingJobId(null);
        setNewJob(defaultJobState);
        fetchJobs();
        fetchCategories();
        fetchStats();
      } else {
        alert('Failed to save job. Check backend logs.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (job: any) => {
    setEditingJobId(job.id);
    setNewJob({
      title: job.title || '',
      categoryId: job.categoryId || '',
      newCategoryName: '',
      locationCity: job.locationCity || '',
      locationState: job.locationState || '',
      experienceLevel: job.experienceLevel || 'Entry Level',
      workMode: job.workMode || 'Remote',
      jobType: job.jobType || 'Permanent',
      description: job.description || '',
      requirements: job.requirements || '',
      salary: job.salary || '',
      salaryType: job.salaryType || 'Month',
      salaryVisible: job.salaryVisible !== false,
      recruitmentPosition: job.recruitmentPosition || '',
      vacancyCount: job.vacancyCount || 1,
      shiftTimings: job.shiftTimings || '',
      benefits: job.benefits || '',
      generalComments: job.generalComments || '',
      facebookLink: job.facebookLink || '',
      instagramLink: job.instagramLink || '',
      linkedinLink: job.linkedinLink || '',
      status: job.status || 'ACTIVE',
      fieldVisibility: job.fieldVisibility || {}
    });
    setIsCreatingJob(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only JPEG, JPG, and PNG formats are accepted.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large before compression.');
      e.target.value = '';
      return;
    }

    try {
      const options = {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      // @ts-ignore
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('file', compressedFile);
      
      const res = await fetch(`${API_URL}/categories/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setNewCategory({...newCategory, imageUrl: data.imageUrl});
      } else {
        alert('Failed to upload image.');
      }
    } catch (error) {
      console.error(error);
      alert('Error compressing or uploading image.');
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Only JPEG, JPG, and PNG formats are accepted.');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large before compression.');
      e.target.value = '';
      return;
    }

    try {
      const options = {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      // @ts-ignore
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('file', compressedFile);
      
      const res = await fetch(`${API_URL}/categories/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setEditingCategoryImage(data.imageUrl);
      } else {
        alert('Failed to upload image.');
      }
    } catch (error) {
      console.error(error);
      alert('Error compressing or uploading image.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return alert('Please enter a category name');
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify(newCategory)
      });
      if (res.ok) {
        alert('Category Created successfully!');
        setNewCategory({ name: '', imageUrl: '' });
        fetchCategories();
      } else {
        const text = await res.text();
        alert(`Failed to create category! Error: ${text}`);
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to connect to backend.');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ name: editingCategoryName, imageUrl: editingCategoryImage })
      });
      if (res.ok) {
        alert('Category Updated successfully!');
        setEditingCategoryId(null);
        fetchCategories();
        fetchJobs(); // Update names in jobs instantly
      } else {
        const text = await res.text();
        alert(`Failed to update category! Error: ${text}`);
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to connect to backend.');
    }
  };

  const handleUpdateJobApproval = async (id: string, status: string, routeType: string = 'SKYO') => {
    try {
      const res = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ approvalStatus: status, routeType })
      });
      if (res.ok) {
        alert(`Job ${status.toLowerCase()} successfully!`);
        fetchJobs();
      } else {
        alert('Failed to update approval status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveClosure = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/jobs/${id}/approve-closure`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
      if (res.ok) {
        alert('Job closure approved and marked as COMPLETED.');
        fetchJobs();
        fetchStats();
      } else {
        alert('Failed to approve job closure.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleJobStatus = (id: string, currentStatus: string) => {
    setJobToConfirmStatus({ id, currentStatus });
  };

  const confirmJobStatusUpdate = async () => {
    if (!jobToConfirmStatus) return;
    const { id, currentStatus } = jobToConfirmStatus;
    const newStatus = currentStatus === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    try {
      const res = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) { fetchJobs(); fetchStats(); }
      else alert('Failed to update job status.');
    } catch (err) { console.error(err); }
    setJobToConfirmStatus(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? All jobs within this category will ALSO be deleted permanently!")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` }
      });
      if (res.ok) {
        alert('Category and associated jobs deleted successfully!');
        fetchCategories();
        fetchJobs(); // Refetch jobs since some are deleted
      } else {
        const text = await res.text();
        alert(`Failed to delete category! Error: ${text}`);
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to connect to backend.');
    }
  };

  const updateAppStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) { console.error(err); }
  };

  const handlePassToEmployer = async (appId: string, employerId: string) => {
    if(!window.confirm('Are you sure you want to pass this applicant to the selected employer?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/applications/${appId}/assign-employer/${employerId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` }
      });
      if (res.ok) {
        alert('Applicant passed to employer successfully!');
        fetchApplications();
      }
    } catch (err) { console.error(err); }
  };

  const handleDateOrTimeChange = (type: 'date' | 'time', value: string) => {
    if (type === 'date') setInterviewDate(value);
    if (type === 'time') setInterviewTime(value);

    const newDate = type === 'date' ? value : interviewDate;
    const newTime = type === 'time' ? value : interviewTime;

    let msg = emailMessage;
    msg = msg.replace(/\nDate: .*/g, '');
    msg = msg.replace(/\nTime: .*/g, '');

    if (newDate || newTime) {
      const scheduleText = `\nDate: ${newDate}\nTime: ${newTime}`;
      if (msg.includes('scheduled as follows:')) {
        msg = msg.replace('scheduled as follows:', `scheduled as follows:${scheduleText}`);
      } else {
        msg += `\n${scheduleText}`;
      }
    }
    
    setEmailMessage(msg);
  };

  const viewResume = async (appId: string, resumeUrl: string) => {
    const app = applications.find(a => a.id === appId);
    if (app && app.status === 'APPLIED') {
      await updateAppStatus(appId, 'UNDER_REVIEW');
    }
    try {
      await fetch(`${API_URL}/applications/${appId}/review`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
    } catch (err) {
      console.error('Failed to mark as reviewed', err);
    }
    window.open(resumeUrl.startsWith('http') ? resumeUrl : `${API_URL}${resumeUrl.replace('./uploads', '/uploads')}`, '_blank');
  };

  const sendCustomEmail = async (appId: string) => {
    if (!emailMessage.trim()) return alert('Please write a message first.');
    setSendingEmail(true);
    try {
      const res = await fetch(`${API_URL}/applications/${appId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ subject: emailSubject, message: emailMessage })
      });
      if (res.ok) {
        alert('Email sent successfully!');
        setSelectedApp(null);
      } else {
        alert('Failed to send email.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingEmail(false);
    }
  };
  const uniqueLocations = Array.from(new Set(jobs.map(j => `${j.locationCity}, ${j.locationState}`))).filter(Boolean);

  const filteredJobs = jobs.filter(job => {
    const loc = `${job.locationCity}, ${job.locationState}`;
    if (jobCategoryFilter !== 'All' && job.category?.name !== jobCategoryFilter) return false;
    if (jobLocationFilter !== 'All' && loc !== jobLocationFilter) return false;
    if (jobStatusFilter !== 'All' && job.status !== jobStatusFilter) return false;
    return true;
  });

  const indexOfLastJob = jobCurrentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalJobPages = Math.ceil(filteredJobs.length / jobsPerPage);

  if (loading || !adminAuthChecked) return (
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
  );

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B132B] font-sans">
        <form onSubmit={handleAdminLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Skyo Consultancy" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 text-center mb-6">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
              <input type="text" required value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="Enter username" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input type={showAdminPassword ? "text" : "password"} required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 pr-10" placeholder="Enter password" />
                <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showAdminPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-2 shadow-md">Login to Dashboard</button>
          </div>
        </form>
      </div>
    );
  }


  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  // Compute hierarchical data for Categories -> Jobs breakdown
  const categoryDetailedList: { name: string; totalApps: number; jobs: { id: string; title: string; appsCount: number; status: string }[] }[] = [];
  
  if (stats) {
    const catMap: Record<string, { totalApps: number, jobs: any[] }> = {};
    
    // Initialize all categories
    if (categories && categories.length > 0) {
      categories.forEach(cat => {
        catMap[cat.name] = { totalApps: 0, jobs: [] };
      });
    } else if (stats.categoryBreakdown) {
      stats.categoryBreakdown.forEach((cat: any) => {
        catMap[cat.name] = { totalApps: 0, jobs: [] };
      });
    }

    if (jobs && jobs.length > 0) {
      jobs.forEach(job => {
        const catName = job.category?.name || 'Uncategorized';
        const appsForJob = applications.filter(app => app.job?.id === job.id).length;
        
        if (!catMap[catName]) catMap[catName] = { totalApps: 0, jobs: [] };
        
        catMap[catName].totalApps += appsForJob;
        catMap[catName].jobs.push({
          id: job.id,
          title: job.title,
          appsCount: appsForJob,
          status: job.status
        });
      });
    }

    Object.keys(catMap).forEach(cat => {
      categoryDetailedList.push({
        name: cat,
        totalApps: catMap[cat].totalApps,
        jobs: catMap[cat].jobs
      });
    });
    
    // Sort categories by number of jobs (descending)
    categoryDetailedList.sort((a, b) => b.jobs.length - a.jobs.length);
  }

  const categoryInnerData: any[] = [];
  const jobsOuterData: any[] = [];
  
  categoryDetailedList.forEach(cat => {
    categoryInnerData.push({
      name: cat.name,
      value: Math.max(cat.totalApps, 1),
      appsCount: cat.totalApps,
      jobsCount: cat.jobs.length
    });
    
    cat.jobs.forEach(job => {
      jobsOuterData.push({
        name: job.title,
        value: Math.max(job.appsCount, 1),
        appsCount: job.appsCount
      });
    });
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B132B] text-slate-300 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pt-8 pb-6 flex items-center justify-center relative">
          <a href="/" className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center">
            <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-16 w-auto object-contain mb-2" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Skyo Admin</span>
          </a>
          <button className="md:hidden text-white absolute right-6 top-8" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-2">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${activeTab === 'dashboard' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <TrendingUp className="h-5 w-5" /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('jobs'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${activeTab === 'jobs' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <Briefcase className="h-5 w-5" /> Jobs
          </button>
          <button 
            onClick={() => { setActiveTab('applications'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${activeTab === 'applications' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <Users className="h-5 w-5" /> Applications
          </button>
          <button 
            onClick={() => { setActiveTab('employers'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${activeTab === 'employers' ? 'bg-blue-800 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-white/10 hover:text-white'}`}
          >
            <Briefcase className="h-5 w-5" /> Employers
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleAdminLogout} className="w-full flex items-center justify-center gap-3 px-3 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors">
            <LogOut className="h-5 w-5" /> Logout Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="bg-white h-20 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 z-10 w-full">
          <div className="flex items-center md:hidden">
            <button className="p-2 -ml-2 text-slate-600" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/">
              <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-10 w-auto object-contain ml-2 mix-blend-multiply" />
            </Link>
          </div>
          <div className="flex items-center gap-6">
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && stats && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Overview Dashboard</h2>
                  <p className="text-slate-500 text-sm mt-1">Here's what's happening with your platform today.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full mix-blend-multiply opacity-50 -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">Total Jobs</p>
                      <p className="text-3xl font-black text-slate-800">{stats.totalJobs}</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-blue-800 rounded-xl"><Briefcase className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                    <TrendingUp className="h-3 w-3 mr-1" /> {stats.activeJobs} Active
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full mix-blend-multiply opacity-50 -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">Total Applications</p>
                      <p className="text-3xl font-black text-slate-800">{stats.totalApplications}</p>
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Users className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                    <TrendingUp className="h-3 w-3 mr-1" /> +12% this week
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full mix-blend-multiply opacity-50 -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">Categories</p>
                      <p className="text-3xl font-black text-slate-800">{stats.categoryBreakdown?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Layers className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-md">
                    All Active
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full mix-blend-multiply opacity-50 -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1">Total Employers</p>
                      <p className="text-3xl font-black text-slate-800">{employersList?.length || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><Building2 className="h-5 w-5" /></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                    <TrendingUp className="h-3 w-3 mr-1" /> Registered
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full mb-8">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-amber-500" /> Platform Advanced Distribution (Categories &rarr; Jobs)</h3>
                <div className="w-full">
                  <RelationalFlowChart categories={categories} jobs={jobs} applications={applications} />
                </div>
              </div>
            </div>
          )}

          {/* JOBS & CATEGORIES TAB */}
          {activeTab === 'jobs' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Job Postings & Categories</h2>
                  <p className="text-slate-500 text-sm mt-1">Manage jobs and job categories in one place.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" /> {showCategoryForm ? 'Close Category' : 'Manage Categories'}
                  </button>
                  <a 
                    href={`${API_URL}/admin/jobs/export`}
                    target="_blank"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Jobs
                  </a>
                  <button 
                    onClick={() => setIsCreatingJob(!isCreatingJob)}
                    className="bg-blue-800 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                  >
                    {isCreatingJob ? 'Cancel' : <><Briefcase className="w-4 h-4" /> Create New Job</>}
                  </button>
                </div>
              </div>

              {/* Job Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Jobs</p>
                    <p className="text-3xl font-black text-slate-800">{jobs.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-blue-800">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Active Jobs</p>
                    <p className="text-3xl font-black text-emerald-600">{jobs.filter(j => j.status === 'ACTIVE').length}</p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-1">Completed Jobs</p>
                    <p className="text-3xl font-black text-purple-600">{jobs.filter(j => j.status === 'COMPLETED').length}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <Briefcase className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Manage Category Section */}
              {showCategoryForm && (
                <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100 mb-8 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers className="h-5 w-5 text-purple-500" /> Add New Category</h3>
                  <form onSubmit={handleCreateCategory} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end mb-8">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Category Name</label>
                      <input type="text" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full border border-purple-200 p-2.5 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white" placeholder="e.g. Sales" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">Upload Image (Max 100KB, JPG/PNG)</label>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png"
                        required={!newCategory.imageUrl}
                        onChange={handleImageUpload} 
                        className="w-full border border-purple-200 p-1.5 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" 
                      />
                    </div>
                    <button type="submit" className="bg-purple-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-purple-700 h-[46px] shadow-sm w-full md:w-auto">Add Category</button>
                  </form>
                  
                  <h3 className="font-bold text-slate-800 mb-4 border-t border-purple-100 pt-6 flex items-center gap-2"><Settings className="h-5 w-5 text-purple-500" /> Existing Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat: any) => (
                      <div key={cat.id} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                        {editingCategoryId === cat.id ? (
                          <div className="flex flex-1 items-center gap-2">
                            {editingCategoryImage && <img src={editingCategoryImage} alt="preview" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-purple-200" />}
                            <input 
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleEditImageUpload}
                              className="hidden"
                              id={`edit-cat-img-${cat.id}`}
                            />
                            <label htmlFor={`edit-cat-img-${cat.id}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md cursor-pointer shrink-0 font-bold text-xs" title="Change Image">
                              <Upload className="w-3.5 h-3.5" /> Upload Image
                            </label>
                            <input 
                              type="text" 
                              value={editingCategoryName} 
                              onChange={e => setEditingCategoryName(e.target.value)} 
                              className="flex-1 w-20 border border-purple-300 p-1.5 rounded-md outline-none focus:border-purple-500 text-sm font-bold" 
                              autoFocus 
                            />
                            <button onClick={() => handleUpdateCategory(cat.id)} className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md shrink-0">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingCategoryId(null)} className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 overflow-hidden">
                              {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 rounded-lg object-cover" />}
                              <div className="truncate">
                                <p className="font-bold text-sm text-slate-800 truncate">{cat.name}</p>
                                <p className="text-xs font-medium text-slate-500">{cat.jobCount || 0} active jobs</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <button onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); setEditingCategoryImage(cat.imageUrl || ''); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Category">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete Category">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isCreatingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 mb-8 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                      <h3 className="font-bold text-xl">{editingJobId ? 'Edit Job' : 'Post a New Job'}</h3>
                      <button type="button" onClick={() => { setEditingJobId(null); setNewJob(defaultJobState); setIsCreatingJob(false); }} className="text-sm text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg font-bold">Close</button>
                    </div>
                    <form onSubmit={handleSaveJob} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                          <input required type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Frontend Developer" />
                        </div>
                        <FieldToggle field="title" />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Select Category <span className="text-red-500">*</span></label>
                          <select 
                            required
                            value={newJob.categoryId} 
                            onChange={e => setNewJob({...newJob, categoryId: e.target.value, newCategoryName: ''})} 
                            className="w-full border p-2 rounded outline-none focus:border-amber-500"
                          >
                            <option value="" disabled>-- Choose Category --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            <option value="NEW">Others (Type manually)</option>
                          </select>
                        </div>
                        <FieldToggle field="category" />
                      </div>

                      {newJob.categoryId === 'NEW' && (
                        <div className="md:col-span-2 flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-bold text-blue-700 mb-1">New Category Name <span className="text-red-500">*</span></label>
                            <input type="text" required value={newJob.newCategoryName} onChange={e => setNewJob({...newJob, newCategoryName: e.target.value})} className="w-full border border-blue-300 p-2 rounded outline-none focus:border-amber-500 bg-blue-50" placeholder="e.g. Data Science" />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">No. Of. Vacancies</label>
                          <input type="text" value={newJob.vacancyCount} onChange={e => setNewJob({...newJob, vacancyCount: e.target.value as any})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. 10" />
                        </div>
                        <FieldToggle field="vacancyCount" />
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Location City <span className="text-red-500">*</span></label>
                          <input type="text" required value={newJob.locationCity} onChange={e => setNewJob({...newJob, locationCity: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Bangalore" />
                        </div>
                        <FieldToggle field="locationCity" />
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Location State <span className="text-red-500">*</span></label>
                          <input type="text" required value={newJob.locationState} onChange={e => setNewJob({...newJob, locationState: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Karnataka" />
                        </div>
                        <FieldToggle field="locationState" />
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Job Type <span className="text-red-500">*</span></label>
                          <select required value={newJob.jobType} onChange={e => setNewJob({...newJob, jobType: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                            <option value="Permanent">Permanent</option>
                            <option value="Temporary">Temporary</option>
                            <option value="Contract">Contract</option>
                          </select>
                        </div>
                        <FieldToggle field="jobType" />
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Work Mode <span className="text-red-500">*</span></label>
                          <select required value={newJob.workMode} onChange={e => setNewJob({...newJob, workMode: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                            <option value="Remote">Remote</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Hybrid">Hybrid</option>
                          </select>
                        </div>
                        <FieldToggle field="workMode" />
                      </div>
                      
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
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
                        <FieldToggle field="shiftTimings" />
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Experience Level <span className="text-red-500">*</span></label>
                          <select required value={newJob.experienceLevel} onChange={e => setNewJob({...newJob, experienceLevel: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                            <option value="Entry Level">Entry Level</option>
                            <option value="Mid Level">Mid Level</option>
                            <option value="Senior Level">Senior Level</option>
                            <option value="Executive">Executive</option>
                          </select>
                        </div>
                        <FieldToggle field="experienceLevel" />
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1 flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Salary Amount <span className="text-red-500">*</span></label>
                            <input type="text" required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. ₹30,000" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-bold text-zinc-700 mb-1">Per</label>
                            <select required value={newJob.salaryType} onChange={e => setNewJob({...newJob, salaryType: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                              <option value="Month">Month</option>
                              <option value="Year">Year</option>
                            </select>
                          </div>
                        </div>
                        <FieldToggle field="salary" />
                      </div>



                      <div className="md:col-span-2 flex gap-2 items-start">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Other Benefits</label>
                          <textarea value={newJob.benefits} onChange={e => setNewJob({...newJob, benefits: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={2}></textarea>
                        </div>
                        <div className="mt-6"><FieldToggle field="benefits" /></div>
                      </div>

                      <div className="md:col-span-2 flex gap-2 items-start">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">General Comments</label>
                          <textarea value={newJob.generalComments} onChange={e => setNewJob({...newJob, generalComments: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={2}></textarea>
                        </div>
                        <div className="mt-6"><FieldToggle field="generalComments" /></div>
                      </div>

                      <div className="md:col-span-2 flex gap-2 items-start">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Description <span className="text-red-500">*</span></label>
                          <textarea required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={3}></textarea>
                        </div>
                        <div className="mt-6"><FieldToggle field="description" /></div>
                      </div>

                      <div className="md:col-span-2 flex gap-2 items-start">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Requirements <span className="text-red-500">*</span></label>
                          <textarea required value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={3}></textarea>
                        </div>
                        <div className="mt-6"><FieldToggle field="requirements" /></div>
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="font-bold text-slate-800 border-b pb-2 mb-4 mt-2">Company Social Links (Optional)</h4>
                      </div>
                      
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">LinkedIn Link</label>
                          <input type="url" value={newJob.linkedinLink} onChange={e => setNewJob({...newJob, linkedinLink: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="https://linkedin.com/company/..." />
                        </div>
                        <FieldToggle field="linkedinLink" />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Facebook Link</label>
                          <input type="url" value={newJob.facebookLink} onChange={e => setNewJob({...newJob, facebookLink: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="https://facebook.com/..." />
                        </div>
                        <FieldToggle field="facebookLink" />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Instagram Link</label>
                          <input type="url" value={newJob.instagramLink} onChange={e => setNewJob({...newJob, instagramLink: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="https://instagram.com/..." />
                        </div>
                        <FieldToggle field="instagramLink" />
                      </div>

                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                      <button type="button" onClick={() => { setEditingJobId(null); setNewJob(defaultJobState); setIsCreatingJob(false); }} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                      <button type="submit" formNoValidate className="bg-blue-800 text-white font-bold py-2.5 px-8 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">{editingJobId ? 'Update & Save Job' : 'Publish Job'}</button>
                    </div>
                  </form>
                  </div>
                </div>
              )}

              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select value={jobStatusFilter} onChange={e => setJobStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-medium outline-none focus:border-amber-500">
                    <option value="All">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select value={jobCategoryFilter} onChange={e => setJobCategoryFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-medium outline-none focus:border-amber-500">
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                  <select value={jobLocationFilter} onChange={e => setJobLocationFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-sm font-medium outline-none focus:border-amber-500">
                    <option value="All">All Locations</option>
                    {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              {/* Jobs Grid */}
              {filteredJobs.length === 0 && !isCreatingJob && (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No job postings found matching your filters.</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {currentJobs.map(job => (
                  <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-lg text-slate-800 group-hover:text-blue-800 transition-colors">{job.title}</h3>
                          <span className="bg-blue-50 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border border-blue-100">
                            {job.jobCode}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {job.locationCity}, {job.locationState}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${
                          job.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 
                          job.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border border-green-200' : 
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {job.status}
                        </span>
                        {job.closureRequested && job.status !== 'COMPLETED' && (
                          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black bg-purple-100 text-purple-700 border border-purple-200">
                            CLOSURE REQUESTED
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${job.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : job.approvalStatus === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                          {job.approvalStatus ? job.approvalStatus.replace('_', ' ') : 'APPROVED'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs font-bold mb-4">
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md border border-purple-100 flex items-center gap-1"><Layers className="h-3 w-3"/> {job.category?.name || 'General'}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">{job.jobType}</span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">{job.experienceLevel}</span>
                    </div>

                    {job.approvalStatus === 'PENDING_APPROVAL' && (
                      <div className="flex flex-col gap-2 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <label className="text-xs font-bold text-slate-700">Approval Route:</label>
                        <select 
                          className="w-full bg-white border border-amber-200 p-1.5 rounded text-xs font-bold text-slate-700 outline-none focus:border-amber-400"
                          value={jobRouteTypes[job.id] || 'SKYO'}
                          onChange={(e) => setJobRouteTypes({...jobRouteTypes, [job.id]: e.target.value})}
                        >
                          <option value="SKYO">Through Skyo (Mask Employer)</option>
                          <option value="DIRECT">Direct (Show Employer)</option>
                        </select>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleUpdateJobApproval(job.id, 'APPROVED', jobRouteTypes[job.id] || 'SKYO')} className="flex-1 bg-emerald-500 text-white font-bold py-1.5 rounded hover:bg-emerald-600 text-xs shadow-sm">
                            Approve Job
                          </button>
                          <button onClick={() => handleUpdateJobApproval(job.id, 'REJECTED')} className="flex-1 bg-red-500 text-white font-bold py-1.5 rounded hover:bg-red-600 text-xs shadow-sm">
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {job.closureRequested && job.status !== 'COMPLETED' && (
                      <div className="flex gap-2 mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100 items-center justify-between">
                        <div className="text-xs font-bold text-purple-800">Employer marked this job as Hired.</div>
                        <button onClick={() => handleApproveClosure(job.id)} className="bg-purple-600 text-white font-bold py-1.5 px-4 rounded hover:bg-purple-700 text-xs shadow-sm whitespace-nowrap">
                          Approve Closure
                        </button>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => window.open(`${API_URL}/admin/jobs/${job.id}/export`, '_blank')} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded hover:bg-emerald-100 flex items-center gap-1 border border-emerald-200">
                          Export Excel
                        </button>
                        <button
                          onClick={() => handleToggleJobStatus(job.id, job.status)}
                          className={`text-xs font-bold px-3 py-1.5 rounded border transition-colors ${
                            job.status === 'ACTIVE'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          }`}
                        >
                          {job.status === 'ACTIVE' ? '✓ Mark Completed' : '↺ Mark Active'}
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3"/> {new Date(job.createdAt).toLocaleDateString()}</span>
                        <button onClick={() => handleEditClick(job)} className="text-sm font-bold text-blue-800 hover:text-blue-800 flex items-center gap-1">
                          Edit <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Jobs Pagination Controls */}
              {totalJobPages > 1 && (
                <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-sm text-slate-500 font-medium">
                    Showing {indexOfFirstJob + 1} to {Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setJobCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={jobCurrentPage === 1}
                      className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm font-bold disabled:opacity-50 hover:bg-slate-50 text-slate-700"
                    >
                      Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalJobPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setJobCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-colors ${
                            jobCurrentPage === page 
                              ? 'bg-blue-800 text-white' 
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setJobCurrentPage(prev => Math.min(prev + 1, totalJobPages))}
                      disabled={jobCurrentPage === totalJobPages}
                      className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm font-bold disabled:opacity-50 hover:bg-slate-50 text-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-zinc-800">Candidate Applications</h2>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={`${API_URL}/admin/candidates/export`}
                    target="_blank"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Candidates
                  </a>
                  <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-blue-800 font-bold flex items-center gap-2 text-sm">
                    <span>New</span>
                    <span className="bg-blue-800 text-white px-2 py-0.5 rounded-md text-xs">{applications.filter((a: any) => a.status === 'APPLIED').length}</span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-800 font-bold flex items-center gap-2 text-sm">
                    <span>Total</span>
                    <span className="bg-zinc-600 text-white px-2 py-0.5 rounded-md text-xs">{applications.length}</span>
                  </div>
                </div>
              </div>
              
              {/* Application Filters */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select value={appCategoryFilter} onChange={e => setAppCategoryFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-amber-500 font-medium">
                    {appUniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Job Role</label>
                  <select value={appJobFilter} onChange={e => setAppJobFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-amber-500 font-medium">
                    {appUniqueJobs.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                  <select value={appLocationFilter} onChange={e => setAppLocationFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-amber-500 font-medium">
                    {appUniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select value={appStatusFilter} onChange={e => setAppStatusFilter(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:border-amber-500 font-medium">
                    {appUniqueStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
              </div>

              {applications.length === 0 ? (
                <p className="text-zinc-500 italic">No applications found.</p>
              ) : filteredApplications.length === 0 ? (
                <p className="text-zinc-500 italic">No applications match your filters.</p>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="p-4 font-bold text-sm text-zinc-600">Ref ID</th>
                        <th className="p-4 font-bold text-sm text-zinc-600">Applicant Details</th>
                        <th className="p-4 font-bold text-sm text-zinc-600">Role Applied For</th>
                        <th className="p-4 font-bold text-sm text-zinc-600">Status</th>
                        <th className="p-4 font-bold text-sm text-zinc-600 text-center">Communication</th>
                        <th className="p-4 font-bold text-sm text-zinc-600 text-center">Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {currentApps.map(app => (
                        <tr key={app.id} className="hover:bg-zinc-50">
                          <td className="p-4 text-sm font-bold text-zinc-800">{app.referenceNumber || 'N/A'}</td>
                          <td className="p-4">
                            <p className="font-bold text-sm text-zinc-900">{app.firstName || 'Unknown'} {app.lastName || ''}</p>
                            <p className="text-xs text-zinc-500">{app.email || app.candidate?.email}</p>
                            <p className="text-xs text-zinc-500">{app.phone || ''}</p>
                            <button onClick={() => viewResume(app.id, app.resumeUrl)} className="text-xs font-bold text-blue-800 hover:underline mt-1">View Resume</button>
                          </td>
                          <td className="p-4 text-sm font-medium text-zinc-700">{app.job?.title || 'General'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              app.status === 'SELECTED' ? 'bg-green-100 text-green-700' :
                              app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              app.status === 'UNDER_REVIEW' ? 'bg-amber-50 text-blue-700' :
                              app.status === 'INTERVIEW_SCHEDULED' ? 'bg-purple-100 text-purple-700' :
                              'bg-zinc-100 text-zinc-700'
                            }`}>
                              {app.status === 'SELECTED' ? 'Appointed' : app.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => {
                                if (app.status === 'SELECTED') {
                                  alert('This applicant has already been Appointed.');
                                  return;
                                }
                                setSelectedApp(app);
                                setIsReInvite(app.status === 'REJECTED');
                                setReInviteJobId('');
                                setEmailSubject(`Interview Invitation: ${app.job?.title || 'SkyoConsultancy'} at SkyoConsultancy`);
                                setEmailMessage(`Hi ${app.firstName || 'Candidate'},\n\nThank you for applying for the ${app.job?.title || 'SkyoConsultancy'} position at SkyoConsultancy. We were very impressed by your background and would like to invite you to an interview to discuss your application further.\n\nYour interview has been scheduled as follows:\n\nWe look forward to learning more about you, your experiences, and how you can make an impact at SkyoConsultancy. Please reply to this email to confirm your availability.\n\nBest regards,\nSkyoConsultancy Team`);
                                setInterviewDate('');
                                setInterviewTime('');
                              }}
                              className="text-xs px-4 py-2 bg-purple-700 text-white rounded-md font-bold hover:bg-purple-800"
                            >
                              Reply / Schedule
                            </button>
                          </td>
                          <td className="p-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button 
                                  onClick={() => {
                                    if (app.status === 'SELECTED') {
                                      alert('This applicant has already been Appointed.');
                                      return;
                                    }
                                    if(window.confirm('Are you sure you want to Appoint this applicant? This will send an automated email and update the status.')) {
                                      updateAppStatus(app.id, 'SELECTED');
                                    }
                                  }} 
                                  className="text-xs px-4 py-1.5 bg-green-50 text-green-600 rounded-md border border-green-200 font-bold hover:bg-green-100"
                                >
                                  Appoint
                                </button>
                                <button 
                                  onClick={() => {
                                    if (app.status === 'REJECTED') {
                                      alert('This applicant has already been Rejected.');
                                      return;
                                    }
                                    if(window.confirm('Are you sure you want to Reject this applicant? This will send an automated email and update the status.')) {
                                      updateAppStatus(app.id, 'REJECTED');
                                    }
                                  }} 
                                  className="text-xs px-4 py-1.5 bg-red-50 text-red-600 rounded-md border border-red-200 font-bold hover:bg-red-100"
                                >
                                  Reject
                                </button>
                              </div>
                              {app.job?.routeType === 'SKYO' && !app.isPassedToEmployer && (
                                <div className="mt-2 flex flex-col gap-1 items-center">
                                  <select 
                                    className="w-full text-xs p-1 border border-blue-200 rounded text-blue-800 bg-blue-50 max-w-[150px]"
                                    value={appEmployerSelections[app.id] || app.job?.employerId || ''}
                                    onChange={e => setAppEmployerSelections(prev => ({ ...prev, [app.id]: e.target.value }))}
                                  >
                                    <option value="">Select Employer</option>
                                    {employersList.map(emp => (
                                      <option key={emp.id} value={emp.id}>{emp.employerProfile?.companyName || emp.email}</option>
                                    ))}
                                  </select>
                                  <button 
                                    onClick={() => {
                                      const employerId = appEmployerSelections[app.id] || app.job?.employerId;
                                      if (!employerId) return alert('Please select an employer first.');
                                      handlePassToEmployer(app.id, employerId);
                                    }} 
                                    className="text-[10px] px-3 py-1 bg-blue-50 text-blue-600 rounded border border-blue-200 font-bold hover:bg-blue-100 uppercase tracking-wider"
                                  >
                                    Pass to Employer
                                  </button>
                                </div>
                              )}
                              {app.job?.routeType === 'SKYO' && app.isPassedToEmployer && (
                                <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center flex flex-col">
                                  <span>Passed to Employer</span>
                                  <span className="text-[9px] truncate max-w-[150px]">{employersList.find(e => e.id === (app.assignedEmployerId || app.job?.employerId))?.employerProfile?.companyName || ''}</span>
                                </div>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Applications Pagination Controls */}
                  {totalAppPages > 1 && (
                    <div className="p-4 border-t border-zinc-200 flex justify-between items-center bg-zinc-50">
                      <span className="text-sm text-zinc-600 font-medium">
                        Showing {indexOfFirstApp + 1} to {Math.min(indexOfLastApp, filteredApplications.length)} of {filteredApplications.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setAppCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={appCurrentPage === 1}
                          className="px-3 py-1.5 rounded-md border border-zinc-300 bg-white text-sm font-bold disabled:opacity-50 hover:bg-zinc-100"
                        >
                          Previous
                        </button>
                        <div className="flex gap-1">
                          {Array.from({ length: totalAppPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setAppCurrentPage(page)}
                              className={`w-8 h-8 rounded-md text-sm font-bold flex items-center justify-center transition-colors ${
                                appCurrentPage === page 
                                  ? 'bg-blue-800 text-white' 
                                  : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setAppCurrentPage(prev => Math.min(prev + 1, totalAppPages))}
                          disabled={appCurrentPage === totalAppPages}
                          className="px-3 py-1.5 rounded-md border border-zinc-300 bg-white text-sm font-bold disabled:opacity-50 hover:bg-zinc-100"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Application Details Modal */}
              {selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-zinc-200">
                      <h2 className="text-xl font-bold">Reply to Applicant</h2>
                    </div>
                    <div className="p-6 space-y-4">
                      {isReInvite && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
                          <p className="text-amber-800 font-bold text-sm mb-3">⚠️ This candidate was previously rejected. Are you inviting them for an interview again?</p>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 mb-3">
                            <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="reinviteRole" className="accent-amber-600" checked={reInviteJobId === ''} onChange={() => {
                                setReInviteJobId('');
                                setEmailSubject(`Interview Invitation: ${selectedApp.job?.title || 'SkyoConsultancy'} at SkyoConsultancy`);
                                let msg = `Hi ${selectedApp.firstName || 'Candidate'},\n\nThank you for applying for the ${selectedApp.job?.title || 'SkyoConsultancy'} position at SkyoConsultancy. We were very impressed by your background and would like to invite you to an interview to discuss your application further.\n\nYour interview has been scheduled as follows:`;
                                if (interviewDate || interviewTime) {
                                  msg += `\nDate: ${interviewDate}\nTime: ${interviewTime}`;
                                }
                                msg += `\n\nWe look forward to learning more about you, your experiences, and how you can make an impact at SkyoConsultancy. Please reply to this email to confirm your availability.\n\nBest regards,\nSkyoConsultancy Team`;
                                setEmailMessage(msg);
                              }} /> 
                              Same Role
                            </label>
                            <label className="text-sm font-bold text-zinc-700 flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="reinviteRole" className="accent-amber-600" checked={reInviteJobId !== ''} onChange={() => {
                                if(jobs.length > 0) {
                                  const defaultJob = jobs[0];
                                  setReInviteJobId(defaultJob.id);
                                  setEmailSubject(`Interview Invitation: ${defaultJob.title} at SkyoConsultancy`);
                                  let msg = `Hi ${selectedApp?.firstName || 'Candidate'},\n\nWe have reviewed your profile and believe you would be a great fit for another open role: ${defaultJob.title} at SkyoConsultancy. We would like to invite you to an interview to discuss this opportunity further.\n\nYour interview has been scheduled as follows:`;
                                  if (interviewDate || interviewTime) {
                                    msg += `\nDate: ${interviewDate}\nTime: ${interviewTime}`;
                                  }
                                  msg += `\n\nWe look forward to learning more about you. Please reply to this email to confirm your availability.\n\nBest regards,\nSkyoConsultancy Team`;
                                  setEmailMessage(msg);
                                }
                              }} /> 
                              Different Role
                            </label>
                          </div>
                          {reInviteJobId !== '' && (
                            <select 
                              className="w-full p-2.5 border border-amber-200 rounded-lg text-sm font-bold text-zinc-700 outline-none focus:border-amber-500" 
                              value={reInviteJobId} 
                              onChange={e => {
                                const jobId = e.target.value;
                                setReInviteJobId(jobId);
                                const selectedJob = jobs.find(j => j.id === jobId);
                                if (selectedJob) {
                                  setEmailSubject(`Interview Invitation: ${selectedJob.title} at SkyoConsultancy`);
                                  let msg = `Hi ${selectedApp?.firstName || 'Candidate'},\n\nWe have reviewed your profile and believe you would be a great fit for another open role: ${selectedJob.title} at SkyoConsultancy. We would like to invite you to an interview to discuss this opportunity further.\n\nYour interview has been scheduled as follows:`;
                                  if (interviewDate || interviewTime) {
                                    msg += `\nDate: ${interviewDate}\nTime: ${interviewTime}`;
                                  }
                                  msg += `\n\nWe look forward to learning more about you. Please reply to this email to confirm your availability.\n\nBest regards,\nSkyoConsultancy Team`;
                                  setEmailMessage(msg);
                                }
                              }}
                            >
                              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                            </select>
                          )}
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">To</label>
                        <input type="text" readOnly value={selectedApp.email || selectedApp.candidate?.email} className="w-full border border-zinc-200 bg-zinc-50 p-2.5 rounded outline-none text-zinc-600 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Subject</label>
                        <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full border p-2.5 rounded outline-none focus:border-purple-500 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 mb-1">Message</label>
                        <textarea 
                          value={emailMessage}
                          onChange={e => setEmailMessage(e.target.value)}
                          className="w-full border p-3 rounded outline-none focus:border-purple-500 text-sm"
                          rows={6}
                        ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Interview Date</label>
                          <input type="date" value={interviewDate} onChange={e => handleDateOrTimeChange('date', e.target.value)} className="w-full border p-2.5 rounded outline-none focus:border-purple-500 text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 mb-1">Interview Time</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text"
                              maxLength={2}
                              placeholder="HH"
                              value={interviewTime ? interviewTime.split(' ')[0].split(':')[0] : ''}
                              onChange={e => {
                                let h = e.target.value.replace(/\D/g, '');
                                if (parseInt(h) > 12) h = '12';
                                const m = (interviewTime ? interviewTime.split(' ')[0].split(':')[1] : '') || '00';
                                const ap = (interviewTime ? interviewTime.split(' ')[1] : '') || 'AM';
                                handleDateOrTimeChange('time', `${h}:${m} ${ap}`);
                              }}
                              onBlur={e => {
                                let h = e.target.value.replace(/\D/g, '');
                                if (h.length === 1) h = '0' + h;
                                if (h === '' || h === '00') h = '12';
                                const m = (interviewTime ? interviewTime.split(' ')[0].split(':')[1] : '') || '00';
                                const ap = (interviewTime ? interviewTime.split(' ')[1] : '') || 'AM';
                                handleDateOrTimeChange('time', `${h}:${m} ${ap}`);
                              }}
                              className="w-full border p-2.5 rounded outline-none focus:border-purple-500 text-sm bg-white font-bold text-center placeholder:font-normal"
                            />
                            <span className="font-black text-slate-400">:</span>
                            <input 
                              type="text"
                              maxLength={2}
                              placeholder="MM"
                              value={interviewTime ? interviewTime.split(' ')[0].split(':')[1] : ''}
                              onChange={e => {
                                const h = (interviewTime ? interviewTime.split(' ')[0].split(':')[0] : '') || '12';
                                let m = e.target.value.replace(/\D/g, '');
                                if (parseInt(m) > 59) m = '59';
                                const ap = (interviewTime ? interviewTime.split(' ')[1] : '') || 'AM';
                                handleDateOrTimeChange('time', `${h}:${m} ${ap}`);
                              }}
                              onBlur={e => {
                                const h = (interviewTime ? interviewTime.split(' ')[0].split(':')[0] : '') || '12';
                                let m = e.target.value.replace(/\D/g, '');
                                if (m.length === 1) m = '0' + m;
                                if (m === '') m = '00';
                                const ap = (interviewTime ? interviewTime.split(' ')[1] : '') || 'AM';
                                handleDateOrTimeChange('time', `${h}:${m} ${ap}`);
                              }}
                              className="w-full border p-2.5 rounded outline-none focus:border-purple-500 text-sm bg-white font-bold text-center placeholder:font-normal"
                            />
                            <select 
                              value={(interviewTime ? interviewTime.split(' ')[1] : '') || 'AM'}
                              onChange={e => {
                                const h = (interviewTime ? interviewTime.split(' ')[0].split(':')[0] : '') || '12';
                                const m = (interviewTime ? interviewTime.split(' ')[0].split(':')[1] : '') || '00';
                                const ap = e.target.value;
                                handleDateOrTimeChange('time', `${h}:${m} ${ap}`);
                              }}
                              className="w-[80px] border p-2.5 rounded outline-none focus:border-purple-500 text-sm bg-white font-bold text-center shrink-0"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-t border-zinc-200 flex justify-end gap-3 bg-zinc-50 rounded-b-xl">
                      <button onClick={() => setSelectedApp(null)} className="px-5 py-2 text-sm font-bold text-zinc-600 hover:text-zinc-900">Cancel</button>
                      <button 
                        onClick={() => sendCustomEmail(selectedApp.id)}
                        disabled={sendingEmail}
                        className="bg-purple-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-800 disabled:opacity-50 text-sm"
                      >
                        {sendingEmail ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EMPLOYERS TAB */}
          {activeTab === 'employers' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-800">Employers Directory</h2>
                  <p className="text-sm text-zinc-500 mt-1">Manage and view all registered employers</p>
                </div>
                <div className="flex gap-3">
                  <a 
                    href={`${API_URL}/admin/employers/export`}
                    target="_blank"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Employers to Excel
                  </a>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="p-4 font-bold text-sm text-zinc-600">Company Name</th>
                      <th className="p-4 font-bold text-sm text-zinc-600">HR Contact</th>
                      <th className="p-4 font-bold text-sm text-zinc-600">Industry</th>
                      <th className="p-4 font-bold text-sm text-zinc-600">Location</th>
                      <th className="p-4 font-bold text-sm text-zinc-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {employersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-zinc-500 italic">No employers found.</td>
                      </tr>
                    ) : (
                      employersList.map(emp => (
                        <React.Fragment key={emp.id}>
                          <tr 
                            className="hover:bg-zinc-50 cursor-pointer transition-colors"
                            onClick={() => setExpandedEmployerId(expandedEmployerId === emp.id ? null : emp.id)}
                          >
                            <td className="p-4">
                              <p className="font-bold text-sm text-zinc-900">{emp.employerProfile?.companyName || 'Not Set'}</p>
                              <p className="text-xs text-zinc-500">{emp.email}</p>
                              {emp.employerProfile?.companyWebsite && (
                                <a href={emp.employerProfile.companyWebsite.startsWith('http') ? emp.employerProfile.companyWebsite : `https://${emp.employerProfile.companyWebsite}`} target="_blank" className="text-xs text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>Website</a>
                              )}
                            </td>
                            <td className="p-4 text-sm text-zinc-700">
                              <p className="font-medium">{emp.employerProfile?.hrName || 'Not Set'}</p>
                              <p className="text-xs text-zinc-500">{emp.phone || emp.employerProfile?.hrContactNumber || 'No Phone'}</p>
                            </td>
                            <td className="p-4 text-sm text-zinc-700">{emp.employerProfile?.industry || 'Not Set'}</td>
                            <td className="p-4 text-sm text-zinc-700">{emp.employerProfile?.companyLocation || 'Not Set'}</td>
                            <td className="p-4 text-sm text-zinc-700">{new Date(emp.createdAt).toLocaleDateString()}</td>
                          </tr>
                          {expandedEmployerId === emp.id && (
                            <tr className="bg-blue-50/50">
                              <td colSpan={5} className="p-0">
                                <div className="p-6 border-t border-blue-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {emp.employerProfile?.companyLogoUrl && (
                                      <div className="lg:col-span-3 mb-2">
                                        <img src={emp.employerProfile.companyLogoUrl} alt="Logo" className="h-16 w-16 object-contain rounded-lg border border-zinc-200 bg-white" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Company Details</p>
                                      <p className="text-sm text-zinc-800"><strong>Name:</strong> {emp.employerProfile?.companyName || 'N/A'}</p>
                                      <p className="text-sm text-zinc-800"><strong>Industry:</strong> {emp.employerProfile?.industry || 'N/A'}</p>
                                      <p className="text-sm text-zinc-800"><strong>Location:</strong> {emp.employerProfile?.companyLocation || 'N/A'}</p>
                                      <p className="text-sm text-zinc-800">
                                        <strong>Website:</strong> {emp.employerProfile?.companyWebsite ? (
                                          <a href={emp.employerProfile.companyWebsite.startsWith('http') ? emp.employerProfile.companyWebsite : `https://${emp.employerProfile.companyWebsite}`} target="_blank" className="text-blue-600 hover:underline">{emp.employerProfile.companyWebsite}</a>
                                        ) : 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Primary Contact (HR)</p>
                                      <p className="text-sm text-zinc-800"><strong>Name:</strong> {emp.employerProfile?.hrName || 'N/A'}</p>
                                      <p className="text-sm text-zinc-800"><strong>Number:</strong> {emp.employerProfile?.hrContactNumber || emp.phone || 'N/A'}</p>
                                      <p className="text-sm text-zinc-800"><strong>Email:</strong> {emp.email}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Additional Contact</p>
                                      <p className="text-sm text-zinc-800"><strong>Official Mail ID:</strong> {emp.employerProfile?.officialMailId || 'N/A'}</p>
                                      <p className="text-sm text-zinc-800"><strong>Secondary Number:</strong> {emp.employerProfile?.secondaryContactNumber || 'N/A'}</p>
                                      <p className="text-sm text-zinc-800"><strong>Registered On:</strong> {new Date(emp.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Job Status Confirmation Modal */}
          {jobToConfirmStatus && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Status Change</h3>
                  <p className="text-slate-600 text-sm">
                    Are you sure you want to mark this job as <strong className="text-slate-800">{jobToConfirmStatus.currentStatus === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE'}</strong>?
                    {jobToConfirmStatus.currentStatus === 'ACTIVE' && " This will remove it from the public job board (after 2 days) and prevent new applications."}
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => setJobToConfirmStatus(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmJobStatusUpdate} className="px-4 py-2 text-sm font-bold text-white bg-[#003c71] hover:bg-[#002b52] rounded-lg transition-colors shadow-sm">
                    Yes, Change Status
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
