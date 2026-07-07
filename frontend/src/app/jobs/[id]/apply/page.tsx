'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
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
    resumeUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, profileRes] = await Promise.all([
          fetch(`${API_URL}/jobs/${jobId}`),
          fetch(`${API_URL}/users/profile`)
        ]);

        if (profileRes.status === 401) {
          router.push('/login?redirect=/jobs/' + jobId + '/apply');
          return;
        }

        const jobData = await jobRes.json();
        const profileData = await profileRes.json();

        setJob(jobData);

        // Check if profile is complete
        const c = profileData.candidateProfile;
        if (!c || !c.resumeUrl || !profileData.firstName || !profileData.lastName || !profileData.phone) {
          alert('Please complete your candidate profile (including Resume) before applying for jobs.');
          router.push('/profile');
          return;
        }

        // Auto-fill
        setFormData({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          email: profileData.email || '',
          noticePeriod: c.noticePeriod || '',
          street: c.addressStreet || '',
          city: c.addressCity || '',
          state: c.addressState || '',
          country: c.addressCountry || '',
          zipCode: c.addressZip || '',
          qualification: c.highestQualification || '',
          experience: c.totalExperienceYears?.toString() || '',
          skills: c.skills || '',
          resumeUrl: c.resumeUrl || ''
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, router, API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          resumeUrl: formData.resumeUrl
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading profile data...</div>;
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
      {/* Header matching Open CV Blue Theme */}
      <div className="bg-[#003c71] text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href={`/jobs/${jobId}`} className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Job Details
          </Link>
          <h1 className="text-4xl font-bold mb-4">Confirm Application</h1>
          <p className="text-xl opacity-90 text-blue-100">Review your profile details before submitting.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-20">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Applying for:</h2>
              
              <div className="mt-4 p-5 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{job.title}</h3>
                  <span className="inline-block px-2.5 py-1 bg-white border border-blue-200 text-blue-800 text-xs font-bold rounded mt-2">{job.jobCode}</span>
                </div>
                <div className="sm:text-right">
                   <p className="text-sm font-medium text-gray-700">{job.locationCity}, {job.locationState}</p>
                   <p className="text-xs text-gray-500 mt-1">{job.jobType} • {job.workMode}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                  Personal Details
                  <Link href="/profile" className="text-blue-600 hover:text-blue-800 text-xs normal-case">Edit in Profile</Link>
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">First Name</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.firstName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Name</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.lastName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.email || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.phone || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Notice Period</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.noticePeriod || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Professional Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Highest Qualification</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.qualification || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Experience (Years)</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.experience || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Skills</label>
                    <p className="mt-1 font-medium text-gray-900">{formData.skills || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                  Resume
                  <Link href="/profile" className="text-blue-600 hover:text-blue-800 text-xs normal-case">Update Resume</Link>
                </h3>
                <div className="mt-1 flex items-center p-4 border border-green-200 bg-green-50 rounded-md">
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">Your resume is attached from your profile.</p>
                    <a href={`${API_URL}${formData.resumeUrl}`} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline mt-1 inline-block">View Document</a>
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
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-[#003c71] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
                >
                  {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
