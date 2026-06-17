'use client';

import { useState, useRef } from 'react';
import { Pencil, Save, X, Upload, Trash2, MapPin, Mail, Phone, Briefcase, GraduationCap, Download, Send, Loader2, User, Plus, Calendar, Building, CheckCircle, Clock, BookOpen, Edit, Camera, LogOut, Check } from 'lucide-react';
import CountrySelect from './CountrySelect';
import JobCard from './JobCard';
import Link from 'next/link';

export default function ProfileView({ profile, onSaved }: { profile: any, onSaved: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 100 * 1024) {
      alert('Avatar size must be less than 100KB.');
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
    const data = new FormData();
    data.append('file', file);
    const token = localStorage.getItem('skyo_token');
    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/profile/avatar`, {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('skyo_token');
      
      const skillsArray = form.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      
      const payload = {
        ...form,
        skills: skillsArray,
        educations: form.educations.map((e: any) => ({
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          startDate: new Date(e.startDate).toISOString(),
          endDate: e.endDate ? new Date(e.endDate).toISOString() : null,
        })),
        experiences: form.experiences.map((exp: any) => ({
          company: exp.company,
          title: exp.title,
          startDate: new Date(exp.startDate).toISOString(),
          endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
          description: exp.description,
        })),
      };

      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/users/profile`, {
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
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden font-sans">
      
      {/* Header Actions */}
      <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-800 hidden sm:block">My Profile</h2>
        <div className="ml-auto flex items-center">
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)} 
            className="flex items-center gap-2 bg-blue-50 hover:bg-amber-50 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCancel} 
              className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              Save Changes
            </button>
          </div>
        )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        
        {/* LEFT COLUMN */}
        <div className="w-full lg:w-1/3 border-r border-zinc-200 p-8 flex flex-col items-center bg-zinc-50/50">
          
          {/* Avatar Section */}
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white flex items-center justify-center">
              {form.avatarUrl ? (
                <img src={form.avatarUrl.startsWith('http') || form.avatarUrl.startsWith('/presets') || form.avatarUrl.startsWith('/avatars') ? form.avatarUrl : `\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${form.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
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
              <textarea name="summary" value={form.summary} onChange={handleChange} className={`${inputClass} min-h-[120px] text-sm`} placeholder="Write your professional summary..."></textarea>
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

        {/* RIGHT COLUMN */}
        <div className="w-full lg:w-2/3 p-8">
          
          {/* Basic Info Grid */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Experience</span>
                <p className="text-sm font-medium text-zinc-800">{calculateExperience()}</p>
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Phone</span>
                {isEditing ? (
                  <div className="flex gap-1 mt-1">
                     <div className="w-20 flex-shrink-0">
                       <CountrySelect value={form.countryCode} onChange={(val) => setForm({ ...form, countryCode: val })} />
                     </div>
                     <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={`${inputClass} flex-1`} placeholder="Phone" />
                  </div>
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.countryCode} {form.phone}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Email</span>
                {isEditing ? (
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={`${inputClass} mt-1`} />
                ) : (
                  <p className="text-sm font-medium text-zinc-800 break-all">{form.email}</p>
                )}
              </div>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Expected CTC</span>
                {isEditing ? (
                   <input type="text" name="expectedSalary" value={form.expectedSalary} onChange={handleChange} className={`${inputClass} mt-1`} placeholder="e.g. 15 LPA" />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.expectedSalary || 'Not specified'}</p>
                )}
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Location</span>
                {isEditing ? (
                   <input type="text" name="address" value={form.address} onChange={handleChange} className={`${inputClass} mt-1`} placeholder="City, Country" />
                ) : (
                  <p className="text-sm font-medium text-zinc-800">{form.address || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-4 border-b border-zinc-100 pb-2">
              <h3 className="text-lg font-bold text-zinc-900">Experience</h3>
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

          {/* Education Section */}
          <div>
            <div className="flex justify-between items-end mb-4 border-b border-zinc-100 pb-2">
              <h3 className="text-lg font-bold text-zinc-900">Education</h3>
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
    </div>
  );
}
