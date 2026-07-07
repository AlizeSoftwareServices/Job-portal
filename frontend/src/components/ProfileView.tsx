'use client';

import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { Pencil, Save, X, Upload, Trash2, MapPin, Mail, Phone, Briefcase, GraduationCap, Download, Send, Loader2, User, Users, Plus, Calendar, Building, CheckCircle, Clock, BookOpen, Edit, Camera, LogOut, Check } from 'lucide-react';
import CountrySelect from './CountrySelect';
import JobCard from './JobCard';
import Link from 'next/link';
import Select from 'react-select';
import { JOB_ROLES } from '@/constants/jobRoles';
export default function ProfileView({ profile, onSaved }: { profile: any, onSaved: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [appliedJobs] = useState(profile?.applications || []);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    '/avatars/avatar_1.png',
    '/avatars/avatar_2.png',
    '/avatars/avatar_3.png',
    '/avatars/avatar_4.png',
    '/avatars/avatar_5.png',
    '/avatars/avatar_6.png',
    '/avatars/avatar_7.png',
    '/avatars/avatar_8.png',
    '/avatars/avatar_9.png',
    '/avatars/avatar_10.png',
  ];

  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    countryCode: profile?.countryCode || '+91',
    phone: profile?.phone || '',
    address: profile?.candidateProfile?.address || '',
    summary: profile?.candidateProfile?.summary || '',
    expectedSalary: profile?.candidateProfile?.expectedSalary || '',
    avatarUrl: profile?.candidateProfile?.avatarUrl || '',
    resumeUrl: profile?.candidateProfile?.resumeUrl || '',
    skills: profile?.candidateProfile?.skills?.map((s: any) => s.name).join(', ') || '',
    educations: profile?.candidateProfile?.educations || [],
    experiences: profile?.candidateProfile?.experiences || [],
    
    gender: profile?.candidateProfile?.gender || '',
    dateOfBirth: profile?.candidateProfile?.dateOfBirth ? new Date(profile?.candidateProfile?.dateOfBirth).toISOString().split('T')[0] : '',
    maritalStatus: profile?.candidateProfile?.maritalStatus || '',
    secondaryContactNumber: profile?.candidateProfile?.secondaryContactNumber || '',
    educationQualification: profile?.candidateProfile?.educationQualification || '',
    totalWorkExperienceYears: profile?.candidateProfile?.totalWorkExperienceYears || '',
    currentWorkingDetails: profile?.candidateProfile?.currentWorkingDetails || '',
    fatherName: profile?.candidateProfile?.fatherName || '',
    fatherOccupation: profile?.candidateProfile?.fatherOccupation || '',
    motherName: profile?.candidateProfile?.motherName || '',
    motherOccupation: profile?.candidateProfile?.motherOccupation || '',
    currentSalary: profile?.candidateProfile?.currentSalary || '',
    currentStay: profile?.candidateProfile?.currentStay || '',
    nativePlace: profile?.candidateProfile?.nativePlace || '',
    interestFieldToWork: profile?.candidateProfile?.interestFieldToWork || [],
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      const res = await fetch(`/api/users/profile/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });
      if (!res.ok) throw new Error();
      const body = await res.json();
      setForm({ ...form, avatarUrl: body.avatarUrl });
    } catch {
      alert('Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 100 * 1024) {
      alert('File size must be less than 100KB.');
      return;
    }
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF and DOCX files are allowed.');
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('skyo_token');
      const res = await fetch(`\${'/api'}/users/profile/resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, resumeUrl: data.resumeUrl });
        alert('Resume uploaded! Save profile to keep changes.');
      } else {
        const err = await res.json();
        alert(err.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload resume.');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.resumeUrl) {
      alert('Please upload your resume before saving the profile.');
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem('skyo_token');
      
      const skillsArray = form.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        countryCode: form.countryCode,
        email: form.email,
        candidateProfile: {
          fullName: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
          phone: form.phone,
          summary: form.summary,
          expectedSalary: form.expectedSalary,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
          maritalStatus: form.maritalStatus,
          secondaryContactNumber: form.secondaryContactNumber,
          educationQualification: form.educationQualification,
          totalWorkExperienceYears: form.totalWorkExperienceYears,
          currentWorkingDetails: form.currentWorkingDetails,
          fatherName: form.fatherName,
          fatherOccupation: form.fatherOccupation,
          motherName: form.motherName,
          motherOccupation: form.motherOccupation,
          currentSalary: form.currentSalary,
          currentStay: form.currentStay,
          nativePlace: form.nativePlace,
          interestFieldToWork: form.interestFieldToWork,
          skills: skillsArray,
          educations: form.educations.map((e: any) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            startDate: e.startDate ? new Date(e.startDate).toISOString() : new Date().toISOString(),
            endDate: e.endDate ? new Date(e.endDate).toISOString() : null,
          })),
          experiences: form.experiences.map((exp: any) => ({
            company: exp.company,
            title: exp.title,
            startDate: exp.startDate ? new Date(exp.startDate).toISOString() : new Date().toISOString(),
            endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
            description: exp.description,
          }))
        }
      };

      const res = await fetch(`\${'/api'}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIsEditing(false);
        onSaved();
      } else {
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      countryCode: profile?.countryCode || '+91',
      phone: profile?.phone || '',
      address: profile?.candidateProfile?.address || '',
      summary: profile?.candidateProfile?.summary || '',
      expectedSalary: profile?.candidateProfile?.expectedSalary || '',
      avatarUrl: profile?.candidateProfile?.avatarUrl || '',
      resumeUrl: profile?.candidateProfile?.resumeUrl || '',
      skills: profile?.candidateProfile?.skills?.map((s: any) => s.name).join(', ') || '',
      educations: profile?.candidateProfile?.educations || [],
      experiences: profile?.candidateProfile?.experiences || [],
      gender: profile?.candidateProfile?.gender || '',
      dateOfBirth: profile?.candidateProfile?.dateOfBirth ? new Date(profile?.candidateProfile?.dateOfBirth).toISOString().split('T')[0] : '',
      maritalStatus: profile?.candidateProfile?.maritalStatus || '',
      secondaryContactNumber: profile?.candidateProfile?.secondaryContactNumber || '',
      educationQualification: profile?.candidateProfile?.educationQualification || '',
      totalWorkExperienceYears: profile?.candidateProfile?.totalWorkExperienceYears || '',
      currentWorkingDetails: profile?.candidateProfile?.currentWorkingDetails || '',
      fatherName: profile?.candidateProfile?.fatherName || '',
      fatherOccupation: profile?.candidateProfile?.fatherOccupation || '',
      motherName: profile?.candidateProfile?.motherName || '',
      motherOccupation: profile?.candidateProfile?.motherOccupation || '',
      currentSalary: profile?.candidateProfile?.currentSalary || '',
      currentStay: profile?.candidateProfile?.currentStay || '',
      nativePlace: profile?.candidateProfile?.nativePlace || '',
      interestFieldToWork: profile?.candidateProfile?.interestFieldToWork || [],
    });
    setIsEditing(false);
  };

  const calculateExperience = () => {
    if (!form.experiences || form.experiences.length === 0) return '0 years';
    let totalMonths = 0;
    form.experiences.forEach((exp: any) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    });
    const years = Math.floor(totalMonths / 12);
    return `${years} years`;
  };

  const inputClass = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow";

  return (
    <div className="font-sans">
      
      {/* Header Actions */}
      <div className="flex flex-wrap gap-4 justify-end items-center mb-4">
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-2 bg-blue-50 hover:bg-[#003c71] text-blue-800 hover:text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN - Sticky Floating Card */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 sticky top-24">
          
          {/* Avatar Section */}
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center">
              {form.avatarUrl ? (
                <img src={form.avatarUrl.startsWith('http') || form.avatarUrl.startsWith('/presets') || form.avatarUrl.startsWith('/avatars') ? form.avatarUrl : `\${'/api'}${form.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-zinc-300" />
              )}
            </div>
            
            {(isEditing || !form.avatarUrl) && (
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer gap-2" onClick={() => avatarInputRef.current?.click()}>
                {uploadingAvatar ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Upload className="w-6 h-6 text-white" />}
                <span className="text-[10px] text-white font-bold">Upload</span>
              </div>
            )}
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleAvatarUpload} />
          </div>

          {isEditing && form.avatarUrl && (
            <button 
              onClick={() => setForm({...form, avatarUrl: ''})} 
              className="text-xs text-red-500 hover:text-red-700 font-bold mb-4 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Remove Photo
            </button>
          )}

          {isEditing && (
            <div className="mb-6 w-full px-4">
              <h4 className="text-xs font-bold text-zinc-500 mb-2 text-center uppercase tracking-wider">Or choose preset</h4>
              <div className="flex flex-wrap gap-1 justify-center">
                {presetAvatars.map((url, i) => (
                  <img 
                    key={i} 
                    src={url} 
                    onClick={() => setForm({...form, avatarUrl: url})}
                    className={`w-8 h-8 rounded-full cursor-pointer object-cover border-2 transition-all hover:scale-110 shadow-sm ${form.avatarUrl === url ? 'border-blue-800 scale-110' : 'border-transparent opacity-80'}`}
                    alt="Preset" 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Name & Title */}
          {isEditing ? (
            <div className="w-full space-y-3 mb-6 text-center">
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} placeholder="First Name" />
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} placeholder="Last Name" />
            </div>
          ) : (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 mb-1">{form.firstName} {form.lastName}</h1>
            </div>
          )}

          {/* Summary */}
          <div className="w-full mb-8">
            {isEditing ? (
              <textarea name="summary" value={form.summary} onChange={handleChange} maxLength={1000} className={`${inputClass} min-h-[120px] text-sm`} placeholder="Write your professional summary..."></textarea>
            ) : (
              <p className="text-sm text-zinc-600 text-center leading-relaxed">
                {form.summary || "No professional summary added yet."}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="w-full">
            <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">Skills</h3>
            {isEditing ? (
              <div>
                <input type="text" name="skills" value={form.skills} onChange={handleChange} className={inputClass} placeholder="React, Node, UX (comma separated)" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {form.skills ? form.skills.split(',').map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-700 shadow-sm">
                    {skill.trim()}
                  </span>
                )) : (
                  <span className="text-xs text-zinc-400 italic">No skills added</span>
                )}
              </div>
            )}
          </div>
          
        </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          {/* Basic Info Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003c71] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              Basic Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">First Name</span>
                {isEditing ? (
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.firstName}</p>
                )}
              </div>
              
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Last Name</span>
                {isEditing ? (
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.lastName}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Gender *</span>
                {isEditing ? (
                  <select name="gender" value={form.gender} onChange={handleChange} className={inputClass} required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.gender || 'Not specified'}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Date of Birth *</span>
                {isEditing ? (
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass} required />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Marital status *</span>
                {isEditing ? (
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={inputClass} required>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.maritalStatus || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Primary contact *</span>
                {isEditing ? (
                  <div className="flex gap-1 mt-1">
                     <div className="w-28 flex-shrink-0">
                       <CountrySelect value={form.countryCode} onChange={(val) => setForm({ ...form, countryCode: val })} />
                     </div>
                     <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={`${inputClass} flex-1`} required />
                  </div>
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.countryCode} {form.phone}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Secondary contact *</span>
                {isEditing ? (
                  <input type="tel" name="secondaryContactNumber" value={form.secondaryContactNumber} onChange={handleChange} className={inputClass} required />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.secondaryContactNumber || 'Not specified'}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email *</span>
                <p className="text-sm font-medium text-zinc-800 break-all">{form.email}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Current stay *</span>
                {isEditing ? (
                   <input type="text" name="currentStay" value={form.currentStay} onChange={handleChange} className={inputClass} required />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.currentStay || 'Not specified'}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Native place *</span>
                {isEditing ? (
                   <input type="text" name="nativePlace" value={form.nativePlace} onChange={handleChange} className={inputClass} required />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.nativePlace || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Family Details Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              Family Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Father Name</span>
                {isEditing ? (
                  <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.fatherName || 'Not specified'}</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Father occupation</span>
                {isEditing ? (
                  <input type="text" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.fatherOccupation || 'Not specified'}</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Mother Name</span>
                {isEditing ? (
                  <input type="text" name="motherName" value={form.motherName} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.motherName || 'Not specified'}</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Mother occupation</span>
                {isEditing ? (
                  <input type="text" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.motherOccupation || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Professional Details Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              Professional Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Education qualification</span>
                {isEditing ? (
                  <input type="text" name="educationQualification" value={form.educationQualification} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.educationQualification || 'Not specified'}</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Total work experience years</span>
                {isEditing ? (
                  <input type="text" name="totalWorkExperienceYears" value={form.totalWorkExperienceYears} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.totalWorkExperienceYears || 'Not specified'}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Current working details</span>
                {isEditing ? (
                  <textarea name="currentWorkingDetails" value={form.currentWorkingDetails} onChange={handleChange} className={inputClass} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.currentWorkingDetails || 'Not specified'}</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Current Salary(Rs)/Month *</span>
                {isEditing ? (
                  <>
                    <input type="text" name="currentSalary" value={form.currentSalary} onChange={handleChange} className={inputClass} required />
                    <span className="text-[10px] text-zinc-500 mt-1 block">If u are a student, put NIL</span>
                  </>
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.currentSalary || 'Not specified'}</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Expected Salary(Rs) /Month *</span>
                {isEditing ? (
                  <input type="text" name="expectedSalary" value={form.expectedSalary} onChange={handleChange} className={inputClass} required />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.expectedSalary || 'Not specified'}</p>
                )}
              </div>
              
              <div className="sm:col-span-2">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Interest field to work</span>
                {isEditing ? (
                  <div className="mt-2 text-sm text-zinc-900">
                    <Select 
                      isMulti
                      options={JOB_ROLES.map(role => ({ value: role, label: role }))}
                      value={form.interestFieldToWork.map((item: string) => ({ value: item, label: item }))}
                      onChange={(selected) => setForm({ ...form, interestFieldToWork: selected.map(s => s.value) })}
                      placeholder="Search and select fields..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.interestFieldToWork && form.interestFieldToWork.length > 0 ? form.interestFieldToWork.map((opt: string) => (
                      <span key={opt} className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">{opt}</span>
                    )) : <p className="text-sm font-medium text-zinc-800">Not specified</p>}
                  </div>
                )}
              </div>
            </div>

            </div>

          {/* Resume Upload Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <h3 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              Resume <span className="text-red-500">*</span>
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {isEditing ? (
                <div className="flex-1 w-full">
                  <label className="block w-full border-2 border-dashed border-zinc-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-zinc-50">
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} />
                    {uploadingResume ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-6 w-6 text-blue-800 animate-spin mb-2" />
                        <span className="font-bold text-sm text-zinc-600">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-6 w-6 text-blue-800 mb-2" />
                        <span className="font-bold text-sm text-zinc-900 block mb-1">Click to upload resume</span>
                        <span className="text-xs text-zinc-500">PDF, DOCX up to 100KB</span>
                      </div>
                    )}
                  </label>
                </div>
              ) : null}
              {form.resumeUrl ? (
                <div className={`w-full ${isEditing ? 'md:w-1/3' : 'md:w-1/2'} bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center flex flex-col items-center justify-center`}>
                  <BookOpen className="h-8 w-8 text-blue-800 mb-2" />
                  <h4 className="font-bold text-sm text-blue-900 mb-2">Resume Uploaded</h4>
                  <a href={`\${'/api'}${form.resumeUrl}`} target="_blank" rel="noreferrer" className="text-sm text-blue-800 hover:underline font-medium">View Current Resume</a>
                </div>
              ) : (
                !isEditing && <p className="text-sm font-medium text-zinc-800">No resume uploaded</p>
              )}
            </div>

            </div>

          {/* Experience Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                Experience
              </h3>
              {isEditing && (
                <button onClick={() => setForm({...form, experiences: [...form.experiences, { title: '', company: '', startDate: '', endDate: '', description: '' }]})} className="text-blue-800 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            
            {form.experiences.length === 0 && !isEditing && (
               <p className="text-sm text-zinc-500 italic">No experience listed.</p>
            )}

            <div className="space-y-6">
              {form.experiences.map((exp: any, i: number) => {
                const sDate = new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                const eDate = exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
                
                return isEditing ? (
                  <div key={i} className="bg-zinc-50 p-4 rounded-xl relative border border-zinc-200">
                    <button onClick={() => setForm({...form, experiences: form.experiences.filter((_: any, idx: number) => idx !== i)})} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                      <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => { const n = [...form.experiences]; n[i].title = e.target.value; setForm({...form, experiences: n}) }} className={inputClass} />
                      <input type="text" placeholder="Company" value={exp.company} onChange={(e) => { const n = [...form.experiences]; n[i].company = e.target.value; setForm({...form, experiences: n}) }} className={inputClass} />
                      <input type="date" value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} onChange={(e) => { const n = [...form.experiences]; n[i].startDate = e.target.value; setForm({...form, experiences: n}) }} className={inputClass} />
                      <input type="date" value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''} onChange={(e) => { const n = [...form.experiences]; n[i].endDate = e.target.value; setForm({...form, experiences: n}) }} className={inputClass} />
                    </div>
                    <textarea placeholder="Description" value={exp.description} onChange={(e) => { const n = [...form.experiences]; n[i].description = e.target.value; setForm({...form, experiences: n}) }} className={`${inputClass} min-h-[60px]`}></textarea>
                  </div>
                ) : (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-blue-800 font-bold text-lg shadow-sm border border-amber-200">
                      {exp.company.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-base">{exp.company}</h4>
                      <p className="text-sm text-zinc-600 font-medium mb-1">{exp.title}</p>
                      <p className="text-xs text-zinc-500">{sDate} - {eDate}</p>
                      {exp.description && <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{exp.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>

          {/* Education Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                Education
              </h3>
              {isEditing && (
                <button onClick={() => setForm({...form, educations: [...form.educations, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }]})} className="text-blue-800 hover:text-blue-700 text-sm font-bold flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
            
            {form.educations.length === 0 && !isEditing && (
               <p className="text-sm text-zinc-500 italic">No education listed.</p>
            )}

            <div className="space-y-4">
              {form.educations.map((edu: any, i: number) => {
                const sDate = new Date(edu.startDate).getFullYear();
                const eDate = edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present';
                
                return isEditing ? (
                  <div key={i} className="bg-zinc-50 p-4 rounded-xl relative border border-zinc-200">
                    <button onClick={() => setForm({...form, educations: form.educations.filter((_: any, idx: number) => idx !== i)})} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-3 pr-8">
                      <input type="text" placeholder="Institution" value={edu.institution} onChange={(e) => { const n = [...form.educations]; n[i].institution = e.target.value; setForm({...form, educations: n}) }} className={inputClass} />
                      <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => { const n = [...form.educations]; n[i].degree = e.target.value; setForm({...form, educations: n}) }} className={inputClass} />
                      <input type="date" value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''} onChange={(e) => { const n = [...form.educations]; n[i].startDate = e.target.value; setForm({...form, educations: n}) }} className={inputClass} />
                      <input type="date" value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''} onChange={(e) => { const n = [...form.educations]; n[i].endDate = e.target.value; setForm({...form, educations: n}) }} className={inputClass} />
                      <input type="text" placeholder="Field of Study" value={edu.fieldOfStudy} onChange={(e) => { const n = [...form.educations]; n[i].fieldOfStudy = e.target.value; setForm({...form, educations: n}) }} className={`${inputClass} col-span-2`} />
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{edu.institution}</h4>
                      <p className="text-sm text-zinc-600">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</p>
                    </div>
                    <div className="text-xs font-bold text-zinc-400 bg-white px-3 py-1 border border-zinc-200 rounded-full">
                      {sDate} - {eDate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      {isEditing && (
        <div className="w-full flex items-center justify-end gap-4 border-t border-zinc-200 pt-8 mt-4">
          <button 
            onClick={handleCancel} 
            className="flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-8 py-3 rounded-xl font-bold transition-all shadow-sm text-lg"
          >
            <X className="w-5 h-5" /> Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 bg-[#003c71] hover:bg-[#002b52] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 text-lg"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
