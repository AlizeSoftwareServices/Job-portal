'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isEditing = id !== 'new';

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
  const [categories, setCategories] = useState<any[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    const token = localStorage.getItem('skyo_admin_token');
    if (localStorage.getItem('skyo_admin_auth') === 'true' && token) {
      setIsAdminAuthenticated(true);
      fetchCategories();
      if (isEditing) {
        fetchJobDetails();
      } else {
        setLoading(false);
      }
    } else {
      router.push('/admin');
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, { headers: { Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` } });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) { console.error(err); }
  };

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/jobs/${id}`);
      if (res.ok) {
        const job = await res.json();
        setNewJob({
          title: job.title || '',
          categoryId: job.categoryId || '',
          newCategoryName: '',
          locationCity: job.locationCity || '',
          locationState: job.locationState || '',
          experienceLevel: job.experienceLevel || '0~2',
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
      } else {
        alert('Failed to fetch job details');
        router.push('/admin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      if (newJob.categoryId === 'NEW' && newJob.newCategoryName.trim() !== '') {
        const catRes = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
          body: JSON.stringify({ name: newJob.newCategoryName.trim() })
        });
        const catData = await catRes.json();
        finalCategoryId = catData.id;
      }

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `${API_URL}/jobs/${id}`
        : `${API_URL}/jobs`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('skyo_admin_token')}` },
        body: JSON.stringify({ ...newJob, categoryId: finalCategoryId, vacancyCount: Number(newJob.vacancyCount) || 1 }) 
      });
      if (res.status === 401) { localStorage.removeItem('skyo_admin_auth'); localStorage.removeItem('skyo_admin_token'); router.push('/admin'); return; }
      if (res.ok) {
        alert(isEditing ? 'Job Updated successfully!' : 'Job Created successfully!');
        router.push('/admin');
      } else {
        alert('Failed to save job. Check backend logs.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="animate-[pulse_1.5s_ease-in-out_infinite] flex flex-col items-center">
          <img src="/logo.png" alt="Skyo Logo" className="h-28 md:h-36 w-auto object-contain mix-blend-multiply" />
          <div className="mt-8 w-48 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
            <div className="h-full bg-sky-600 rounded-full w-1/2 animate-[slideRight_1s_ease-in-out_infinite]" style={{ animation: 'slideRight 1s ease-in-out infinite alternate' }}>
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
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative flex flex-col">
      <header className="bg-white h-20 px-4 md:px-8 flex items-center border-b border-slate-200 z-10 w-full">
        <Link href="/admin" className="flex items-center gap-2 text-sky-800 font-bold hover:text-sky-900 transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Dashboard
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-2xl border border-zinc-200 shadow-sm">
          <h2 className="text-2xl font-black text-slate-800 mb-8 pb-4 border-b border-slate-100">
            {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
          </h2>
          
          <form onSubmit={handleSaveJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">1. Job Title <span className="text-red-500">*</span></label>
                  <input required type="text" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Frontend Developer" />
                </div>
                <FieldToggle field="title" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">2. Select Category <span className="text-red-500">*</span></label>
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
                    <label className="block text-sm font-bold text-sky-700 mb-1">New Category Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={newJob.newCategoryName} onChange={e => setNewJob({...newJob, newCategoryName: e.target.value})} className="w-full border border-sky-300 p-2 rounded outline-none focus:border-amber-500 bg-sky-50" placeholder="e.g. Data Science" />
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">3. No. Of. Vacancies</label>
                  <input type="text" value={newJob.vacancyCount} onChange={e => setNewJob({...newJob, vacancyCount: e.target.value as any})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. 10" />
                </div>
                <FieldToggle field="vacancyCount" />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">4. Location City <span className="text-red-500">*</span></label>
                  <input type="text" required value={newJob.locationCity} onChange={e => setNewJob({...newJob, locationCity: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Bangalore" />
                </div>
                <FieldToggle field="locationCity" />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">5. Location State <span className="text-red-500">*</span></label>
                  <input type="text" required value={newJob.locationState} onChange={e => setNewJob({...newJob, locationState: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. Karnataka" />
                </div>
                <FieldToggle field="locationState" />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">6. Job Type <span className="text-red-500">*</span></label>
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
                  <label className="block text-sm font-bold text-zinc-700 mb-1">7. Work Mode <span className="text-red-500">*</span></label>
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
                  <label className="block text-sm font-bold text-zinc-700 mb-1">8. Shift Timings</label>
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
                  <label className="block text-sm font-bold text-zinc-700 mb-1">9. Experience Years <span className="text-red-500">*</span></label>
                  <select required value={newJob.experienceLevel} onChange={e => setNewJob({...newJob, experienceLevel: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500">
                    <option value="0~2">0~2</option>
                    <option value="3~4">3~4</option>
                    <option value="5~6">5~6</option>
                    <option value="7~8">7~8</option>
                    <option value="9~10">9~10</option>
                    <option value="11~12">11~12</option>
                    <option value="13~14">13~14</option>
                    <option value="14~15">14~15</option>
                    <option value="16~17">16~17</option>
                    <option value="18~19">18~19</option>
                    <option value="20~21">20~21</option>
                    <option value="22~23">22~23</option>
                    <option value="24~25">24~25</option>
                  </select>
                </div>
                <FieldToggle field="experienceLevel" />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-zinc-700 mb-1">10. Salary Amount <span className="text-red-500">*</span></label>
                    <input type="text" required value={newJob.salary} onChange={e => setNewJob({...newJob, salary: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="e.g. ₹30,000" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-zinc-700 mb-1">11. Per</label>
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
                  <label className="block text-sm font-bold text-zinc-700 mb-1">12. Other Benefits</label>
                  <textarea value={newJob.benefits} onChange={e => setNewJob({...newJob, benefits: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={2}></textarea>
                </div>
                <div className="mt-6"><FieldToggle field="benefits" /></div>
              </div>

              <div className="md:col-span-2 flex gap-2 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">13. General Comments</label>
                  <textarea value={newJob.generalComments} onChange={e => setNewJob({...newJob, generalComments: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={2}></textarea>
                </div>
                <div className="mt-6"><FieldToggle field="generalComments" /></div>
              </div>

              <div className="md:col-span-2 flex gap-2 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">14. Roles and Responsibilities <span className="text-red-500">*</span></label>
                  <textarea required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={3}></textarea>
                </div>
                <div className="mt-6"><FieldToggle field="description" /></div>
              </div>

              <div className="md:col-span-2 flex gap-2 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">15. Requirements <span className="text-red-500">*</span></label>
                  <textarea required value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" rows={3}></textarea>
                </div>
                <div className="mt-6"><FieldToggle field="requirements" /></div>
              </div>

              <div className="md:col-span-2">
                <h4 className="font-bold text-slate-800 border-b pb-2 mb-4 mt-2">Company Social Links (Optional)</h4>
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">16. LinkedIn Link</label>
                  <input type="url" value={newJob.linkedinLink} onChange={e => setNewJob({...newJob, linkedinLink: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="https://linkedin.com/company/..." />
                </div>
                <FieldToggle field="linkedinLink" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">17. Facebook Link</label>
                  <input type="url" value={newJob.facebookLink} onChange={e => setNewJob({...newJob, facebookLink: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="https://facebook.com/..." />
                </div>
                <FieldToggle field="facebookLink" />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-1">18. Instagram Link</label>
                  <input type="url" value={newJob.instagramLink} onChange={e => setNewJob({...newJob, instagramLink: e.target.value})} className="w-full border p-2 rounded outline-none focus:border-amber-500" placeholder="https://instagram.com/..." />
                </div>
                <FieldToggle field="instagramLink" />
              </div>

            </div>
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => router.push('/admin')} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button type="submit" formNoValidate className="bg-sky-800 text-white font-bold py-2.5 px-8 rounded-lg hover:bg-sky-700 shadow-sm transition-colors">{isEditing ? 'Update & Save Job' : 'Publish Job'}</button>
            </div>
          </form>
          
        </div>
      </main>
    </div>
  );
}
