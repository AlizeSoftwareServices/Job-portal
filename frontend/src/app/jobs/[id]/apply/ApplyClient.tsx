'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ApplyClient({ job, profileData, candidateProfile }: { job: any, profileData: any, candidateProfile: any }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const router = useRouter();
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const derivedFirstName = profileData.firstName || (candidateProfile?.fullName ? candidateProfile.fullName.split(' ')[0] : '');
  const derivedLastName = profileData.lastName || (candidateProfile?.fullName ? candidateProfile.fullName.substring(derivedFirstName.length).trim() : '');
  const derivedPhone = profileData.phone || candidateProfile?.phone || '';

  useEffect(() => {
    if (!candidateProfile || !candidateProfile.resumeUrl || !derivedFirstName || !derivedPhone) {
      alert('Please complete your candidate profile (including Resume and Contact details) before applying for jobs.');
      router.push('/profile');
    }
  }, [candidateProfile, derivedFirstName, derivedPhone, router]);

  // If incomplete, just show a blank or loading state while redirecting
  if (!candidateProfile || !candidateProfile.resumeUrl || !derivedFirstName || !derivedPhone) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-800"></div></div>;
  }

  const formData = {
    firstName: derivedFirstName,
    lastName: derivedLastName,
    phone: derivedPhone,
    email: profileData.email || '',
    noticePeriod: candidateProfile.noticePeriod || '',
    street: candidateProfile.addressStreet || '',
    city: candidateProfile.addressCity || '',
    state: candidateProfile.addressState || '',
    country: candidateProfile.addressCountry || '',
    zipCode: candidateProfile.addressZip || '',
    qualification: candidateProfile.highestQualification || candidateProfile.educationQualification || '',
    experience: candidateProfile.totalExperienceYears?.toString() || candidateProfile.totalWorkExperienceYears?.toString() || '',
    skills: Array.isArray(candidateProfile.skills) ? candidateProfile.skills.map((s: any) => s.name).join(', ') : (candidateProfile.skills || ''),
    resumeUrl: candidateProfile.resumeUrl || ''
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Use standard fetch without token from localStorage (rely on HttpOnly cookies)
      const response = await fetch(`/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
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
          <Link href="/jobs" className="inline-block bg-sky-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-sky-700 transition">
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
          <Link href={`/jobs/${job.id}`} className="inline-flex items-center text-sky-200 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Job Details
          </Link>
          <h1 className="text-4xl font-bold mb-4">Confirm Application</h1>
          <p className="text-xl opacity-90 text-sky-100">Review your profile details before submitting.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20 relative z-20">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Applying for:</h2>
              
              <div className="mt-4 p-5 bg-sky-50/50 rounded-lg border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-sky-900">{job.title}</h3>
                  <span className="inline-block px-2.5 py-1 bg-white border border-sky-200 text-sky-800 text-xs font-bold rounded mt-2">{job.jobCode}</span>
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
                  <Link href="/profile" className="text-sky-600 hover:text-sky-800 text-xs normal-case">Edit in Profile</Link>
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
                  <Link href="/profile" className="text-sky-600 hover:text-sky-800 text-xs normal-case">Update Resume</Link>
                </h3>
                <div className="mt-1 flex items-center p-4 border border-green-200 bg-green-50 rounded-md">
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <p className="text-sm font-medium text-green-800">Your resume is attached from your profile.</p>
                    <a href={formData.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline mt-1 inline-block">View Document</a>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input id="terms" name="terms" type="checkbox" required className="focus:ring-sky-500 h-4 w-4 text-sky-800 border-gray-300 rounded" />
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
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-sky-800 hover:bg-sky-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
