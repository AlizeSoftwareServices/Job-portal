'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://skyo-backend.onrender.com';
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;
  
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    noticePeriod: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    qualification: '',
    experience: '',
    skills: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/jobs/${jobId}`)
      .then((res) => res.json())
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024) {
        alert('File size exceeds the 100KB limit. Please upload a smaller file.');
        e.target.value = '';
        setResumeFile(null);
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('jobId', jobId);
      Object.keys(formData).forEach((key) => {
        data.append(key, (formData as any)[key]);
      });
      if (resumeFile) {
        data.append('resume', resumeFile);
      }

      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Job not found.</div>;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to <strong>{job.title}</strong>. We have sent a confirmation email to your inbox.
          </p>
          <Link href="/jobs" className="inline-block bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Explore More Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching Adecco style (Red header) */}
      <div className="bg-[#cc0000] text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Register / Apply</h1>
          <p className="text-xl opacity-90">Find a great job anywhere in the world.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <h2 className="text-xl text-gray-800 mb-1">Thank you for your interest!</h2>
              <p className="text-sm text-gray-600">Please fill in your personal information and upload your CV to apply for this position.</p>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Job Title</span>
                  <h3 className="text-lg font-medium text-gray-900 mt-1">{job.title}</h3>
                </div>
                <div className="text-right">
                   <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Location</span>
                   <p className="text-sm font-medium text-gray-700 mt-1">{job.locationCity}, {job.locationState}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (Primary) *</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Notice Period *</label>
                    <select name="noticePeriod" required value={formData.noticePeriod} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border">
                      <option value="">-- None --</option>
                      <option value="Immediate">Immediate</option>
                      <option value="15 Days">15 Days</option>
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3 Months+">3 Months+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Professional Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Highest Qualification *</label>
                    <input type="text" name="qualification" required value={formData.qualification} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" placeholder="e.g. B.Tech, MBA" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Experience (Years) *</label>
                    <input type="text" name="experience" required value={formData.experience} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" placeholder="e.g. 2, 5, Fresher" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Skills *</label>
                    <input type="text" name="skills" required value={formData.skills} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" placeholder="e.g. React, Node.js, Communication" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Address Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Street</label>
                    <input type="text" name="street" value={formData.street} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State/Province</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zip/Postal Code</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Upload CV / Resume</h3>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-800 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 100KB</p>
                    {resumeFile && <p className="text-sm font-medium text-green-600 mt-2">Selected: {resumeFile.name}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="terms" name="terms" type="checkbox" required className="focus:ring-blue-500 h-4 w-4 text-blue-800 border-gray-300 rounded" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">Privacy Policy & Terms</label>
                    <p className="text-gray-500">I acknowledge that I have read and understood the privacy statement and terms of use. I consent to the storage of my personal data for employment purposes.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#008c44] hover:bg-[#006e35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
