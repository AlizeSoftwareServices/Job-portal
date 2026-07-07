'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, Plus, Trash2, Loader2, FileText, User, Image as ImageIcon } from 'lucide-react';
import CountrySelect from './CountrySelect';
import Select from 'react-select';
import { JOB_ROLES } from '@/constants/jobRoles';
export default function EditProfileForm({ profile, onSaved, onLogout }: { profile: any, onSaved: () => void, onLogout: () => void }) {
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    'https://randomuser.me/api/portraits/men/1.jpg',
    'https://randomuser.me/api/portraits/men/22.jpg',
    'https://randomuser.me/api/portraits/men/33.jpg',
    'https://randomuser.me/api/portraits/men/44.jpg',
    'https://randomuser.me/api/portraits/men/55.jpg',
    'https://randomuser.me/api/portraits/women/1.jpg',
    'https://randomuser.me/api/portraits/women/22.jpg',
    'https://randomuser.me/api/portraits/women/33.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/women/55.jpg',
  ];
  
  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    email: profile?.email || '',
    countryCode: profile?.countryCode || '+91',
    phone: profile?.phone || '',
    address: profile?.candidateProfile?.address || '',
    summary: profile?.candidateProfile?.summary || '',
    resumeUrl: profile?.candidateProfile?.resumeUrl || '',
    expectedSalary: profile?.candidateProfile?.expectedSalary || '',
    preferredLocation: profile?.candidateProfile?.preferredLocation || '',
    preferredJobType: profile?.candidateProfile?.preferredJobType || '',
    avatarUrl: profile?.candidateProfile?.avatarUrl || '',
    skills: profile?.candidateProfile?.skills?.map((s: any) => s.name).join(', ') || '',
    educations: profile?.candidateProfile?.educations || [],
    experiences: profile?.candidateProfile?.experiences || [],
    
    // New Fields
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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check constraints: max 100KB, pdf/docx
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
      const res = await fetch(`/api/users/profile/resume`, {
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

  const handleAddEducation = () => {
    setForm({
      ...form,
      educations: [...form.educations, { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' }]
    });
  };

  const handleRemoveEducation = (index: number) => {
    const newEdus = [...form.educations];
    newEdus.splice(index, 1);
    setForm({ ...form, educations: newEdus });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEdus = [...form.educations];
    newEdus[index] = { ...newEdus[index], [field]: value };
    setForm({ ...form, educations: newEdus });
  };

  const handleAddExperience = () => {
    setForm({
      ...form,
      experiences: [...form.experiences, { company: '', title: '', description: '', startDate: '', endDate: '' }]
    });
  };

  const handleRemoveExperience = (index: number) => {
    const newExps = [...form.experiences];
    newExps.splice(index, 1);
    setForm({ ...form, experiences: newExps });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExps = [...form.experiences];
    newExps[index] = { ...newExps[index], [field]: value };
    setForm({ ...form, experiences: newExps });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('skyo_token');
    
    // Process skills
    const skillsArray = form.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      countryCode: form.countryCode,
      phone: form.phone,
      candidateProfile: {
        address: form.address,
        summary: form.summary,
        resumeUrl: form.resumeUrl,
        expectedSalary: form.expectedSalary,
        preferredLocation: form.preferredLocation,
        preferredJobType: form.preferredJobType,
        avatarUrl: form.avatarUrl,
        skills: skillsArray,
        educations: form.educations,
        experiences: form.experiences,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
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
      }
    };

    try {
      const res = await fetch(`/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert('Profile updated successfully!');
        if (data.emailChanged) {
          alert('Email was changed. Please log in again.');
          onLogout();
        } else {
          onSaved();
        }
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

  const sectionClass = "bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm mb-6";
  const labelClass = "block text-sm font-bold text-zinc-700 mb-2";
  const inputClass = "w-full border border-zinc-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Basic Info & Avatar */}
      <div className={sectionClass}>
        <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-zinc-100">
          <div className="flex-shrink-0 flex flex-col items-center">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Profile Picture</h3>
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-zinc-100 flex items-center justify-center relative group">
              {form.avatarUrl ? (
                <img src={form.avatarUrl.startsWith('http') ? form.avatarUrl : `/api${form.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-zinc-400" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="p-2 bg-white rounded-full text-zinc-900 hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </button>
                {form.avatarUrl && (
                  <button type="button" onClick={() => setForm({...form, avatarUrl: ''})} className="p-2 bg-white rounded-full text-red-600 hover:scale-110 transition-transform">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleAvatarUpload} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 uppercase tracking-wider">Choose Preset Avatar</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {presetAvatars.map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  onClick={() => setForm({...form, avatarUrl: url})}
                  className={`w-12 h-12 rounded-full cursor-pointer object-cover border-2 transition-all hover:scale-110 shadow-sm ${form.avatarUrl === url ? 'border-blue-800 scale-110 ring-2 ring-blue-200' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  alt="Preset" 
                />
              ))}
            </div>
              <p className="text-zinc-500 text-sm mt-4">
                Or <span className="text-blue-800 font-medium cursor-pointer hover:underline" onClick={() => avatarInputRef.current?.click()}>upload from your system</span> (Max 50KB, JPEG/PNG).
              </p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 mb-6 border-b pb-2">Basic Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClass}>First Name *</label>
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select name="gender" value={form.gender} onChange={handleChange} className={inputClass} required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Date of birth *</label>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Marital status *</label>
            <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={inputClass} required>
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 mb-6 mt-10 border-b pb-2">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClass}>Primary contact number *</label>
            <div className="flex gap-2">
              <div className="w-[110px] flex-shrink-0">
                <CountrySelect value={form.countryCode} onChange={(val) => setForm({ ...form, countryCode: val })} />
              </div>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={`${inputClass} flex-1 min-w-0`} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Secondary contact number *</label>
            <input type="tel" name="secondaryContactNumber" value={form.secondaryContactNumber} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>E-mail id *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} disabled title="Email cannot be changed here" />
          </div>
          <div>
            <label className={labelClass}>Current stay *</label>
            <input type="text" name="currentStay" value={form.currentStay} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Native place *</label>
            <input type="text" name="nativePlace" value={form.nativePlace} onChange={handleChange} className={inputClass} required />
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 mb-6 mt-10 border-b pb-2">Family Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClass}>Father Name</label>
            <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Father occupation</label>
            <input type="text" name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mother Name</label>
            <input type="text" name="motherName" value={form.motherName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Mother occupation</label>
            <input type="text" name="motherOccupation" value={form.motherOccupation} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-900 mb-6 mt-10 border-b pb-2">Professional Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClass}>Education qualification</label>
            <input type="text" name="educationQualification" value={form.educationQualification} onChange={handleChange} className={inputClass} placeholder="e.g., B.E Computer Science" />
          </div>
          <div>
            <label className={labelClass}>Total work experience years</label>
            <input type="text" name="totalWorkExperienceYears" value={form.totalWorkExperienceYears} onChange={handleChange} className={inputClass} placeholder="e.g., 5 years" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Current working details</label>
            <textarea name="currentWorkingDetails" value={form.currentWorkingDetails} onChange={handleChange} className={`${inputClass} min-h-[80px]`} placeholder="Company name, Designation, Role..."></textarea>
          </div>
          <div>
            <label className={labelClass}>Current Salary(Rs)/Month *</label>
            <input type="text" name="currentSalary" value={form.currentSalary} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Expected Salary(Rs) /Month *</label>
            <input type="text" name="expectedSalary" value={form.expectedSalary} onChange={handleChange} className={inputClass} required />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Interest field to work</label>
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
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className={sectionClass}>
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Resume</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <label className="block w-full border-2 border-dashed border-zinc-300 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-zinc-50">
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} />
              {uploadingResume ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-blue-800 animate-spin mb-3" />
                  <span className="font-bold text-zinc-600">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-blue-800 mb-3" />
                  <span className="font-bold text-zinc-900 block mb-1">Click to upload resume</span>
                  <span className="text-sm text-zinc-500">PDF, DOCX up to 100KB</span>
                </div>
              )}
            </label>
          </div>
          {form.resumeUrl && (
            <div className="w-full md:w-1/3 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
              <FileText className="h-10 w-10 text-blue-800 mb-3" />
              <h4 className="font-bold text-blue-900 mb-2">Resume Uploaded</h4>
              <a href={form.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-800 hover:underline font-medium">View Current Resume</a>
            </div>
          )}
        </div>
      </div>

      {/* (Old Preferences Section Removed as it's merged into Professional Details) */}

      {/* Skills */}
      <div className={sectionClass}>
        <h3 className="text-xl font-bold text-zinc-900 mb-6">Skills</h3>
        <div>
          <label className={labelClass}>Key Skills</label>
          <input type="text" name="skills" value={form.skills} onChange={handleChange} className={inputClass} placeholder="e.g. React, Node.js, Python, Project Management (comma separated)" />
          <p className="text-xs text-zinc-500 mt-2">Separate multiple skills with commas.</p>
        </div>
      </div>

      {/* Experience */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-zinc-900">Experience</h3>
          <button type="button" onClick={handleAddExperience} className="text-blue-800 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Experience
          </button>
        </div>
        
        {form.experiences.length === 0 ? (
          <p className="text-zinc-500 text-center py-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">No experience added yet.</p>
        ) : (
          <div className="space-y-6">
            {form.experiences.map((exp: any, index: number) => (
              <div key={index} className="border border-zinc-200 rounded-xl p-6 relative group">
                <button type="button" onClick={() => handleRemoveExperience(index)} className="absolute top-4 right-4 text-zinc-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input type="text" value={exp.title} onChange={(e) => handleExperienceChange(index, 'title', e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <input type="text" value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="date" value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>End Date (Leave blank if current)</label>
                    <input type="date" value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} className={`${inputClass} min-h-[80px]`}></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-zinc-900">Education</h3>
          <button type="button" onClick={handleAddEducation} className="text-blue-800 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Education
          </button>
        </div>
        
        {form.educations.length === 0 ? (
          <p className="text-zinc-500 text-center py-6 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">No education added yet.</p>
        ) : (
          <div className="space-y-6">
            {form.educations.map((edu: any, index: number) => (
              <div key={index} className="border border-zinc-200 rounded-xl p-6 relative group">
                <button type="button" onClick={() => handleRemoveEducation(index)} className="absolute top-4 right-4 text-zinc-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input type="text" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Degree</label>
                    <input type="text" value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} className={inputClass} required placeholder="e.g. B.Tech" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Field of Study</label>
                    <input type="text" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)} className={inputClass} placeholder="e.g. Computer Science" />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input type="date" value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''} onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="date" value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''} onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={saving || uploadingResume} className="bg-blue-800 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center min-w-[200px] text-lg disabled:opacity-70 disabled:cursor-not-allowed">
          {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Save Profile Changes'}
        </button>
      </div>

    </form>
  );
}
