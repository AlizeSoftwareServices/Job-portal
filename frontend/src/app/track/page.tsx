'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, Clock, XCircle, ArrowLeft, Briefcase, Calendar } from 'lucide-react';
import AuthButtons from '../../components/AuthButtons';
import ProfileLink from '../../components/ProfileLink';
import Navbar from '../../components/Navbar';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  
  const [refNumber, setRefNumber] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<any>(null);

  const fetchStatus = async (ref: string) => {
    if (!ref) return;
    setLoading(true);
    setError('');
    setApplication(null);
    try {
      const res = await fetch(`http://localhost:3000/applications/track/${ref}`);
      if (!res.ok) {
        throw new Error('Application not found. Please check your reference number.');
      }
      const data = await res.json();
      setApplication(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchStatus(initialRef);
    }
  }, [initialRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(refNumber);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'APPLIED': return 1;
      case 'UNDER_REVIEW': return 2;
      case 'SHORTLISTED': return 2;
      case 'INTERVIEW_SCHEDULED': return 3;
      case 'SELECTED': return 4;
      case 'REJECTED': return 4;
      default: return 1;
    }
  };

  const currentStep = application ? getStatusStep(application.status) : 0;
  const isRejected = application?.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      {/* Navigation */}
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">Track Your Application</h1>
          <p className="text-zinc-600">Enter your 9-character reference number to see real-time updates.</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-12">
          <input 
            type="text" 
            placeholder="e.g. NEX-7A2-K9Q" 
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            className="flex-1 border border-zinc-300 rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none uppercase tracking-widest font-medium shadow-sm text-lg"
            required
          />
          <button type="submit" className="bg-blue-800 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" /> Track
          </button>
        </form>

        {loading && (
          <div className="text-center py-12 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-500 font-medium">Fetching application details...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-start gap-3 shadow-sm">
            <XCircle className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-1">Error Tracking Application</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {application && !loading && !error && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 pb-6 border-b border-zinc-100 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">{application.job?.title || 'General Application'}</h2>
                <div className="flex flex-wrap items-center gap-4 text-zinc-600 text-sm font-medium">
                  {application.job?.jobCode && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> Code: {application.job.jobCode}</span>}
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                  <span className="bg-zinc-100 px-3 py-1 rounded-full text-zinc-800 tracking-wider uppercase text-xs">{application.referenceNumber}</span>
                </div>
              </div>
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg font-bold text-sm text-center">
                Current Status: <br/><span className="text-lg">{application.status.replace(/_/g, ' ')}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pt-4 pb-8 pl-4 md:pl-0">
              <div className="absolute left-[27px] md:left-1/2 md:-ml-px top-0 bottom-0 w-0.5 bg-zinc-200"></div>
              
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="relative flex md:justify-center items-center">
                  <div className={`hidden md:block w-1/2 pr-12 text-right ${currentStep >= 1 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    <h4 className="font-bold text-lg mb-1">Application Submitted</h4>
                    <p className="text-sm">We received your application.</p>
                  </div>
                  <div className={`absolute left-0 md:relative md:left-auto flex items-center justify-center w-14 h-14 rounded-full border-4 ${currentStep >= 1 ? 'bg-blue-800 border-blue-100 text-white' : 'bg-white border-zinc-200 text-zinc-300'} z-10 shadow-sm transition-colors duration-500`}>
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className={`ml-20 md:ml-0 md:w-1/2 md:pl-12 ${currentStep >= 1 ? 'text-zinc-900' : 'text-zinc-400'} md:hidden`}>
                    <h4 className="font-bold text-lg mb-1">Application Submitted</h4>
                    <p className="text-sm">We received your application.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex md:justify-center items-center">
                  <div className={`ml-20 md:ml-0 md:w-1/2 md:pr-12 text-left md:text-right ${currentStep >= 2 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    <h4 className="font-bold text-lg mb-1">Under Review</h4>
                    <p className="text-sm">Your resume is being reviewed by our team.</p>
                  </div>
                  <div className={`absolute left-0 md:relative md:left-auto flex items-center justify-center w-14 h-14 rounded-full border-4 ${currentStep >= 2 ? 'bg-blue-800 border-blue-100 text-white' : 'bg-white border-zinc-200 text-zinc-300'} z-10 shadow-sm transition-colors duration-500`}>
                    <Search className="h-6 w-6" />
                  </div>
                  <div className="hidden md:block w-1/2 pl-12"></div>
                </div>

                {/* Step 3 */}
                <div className="relative flex md:justify-center items-center">
                  <div className="hidden md:block w-1/2 pr-12 text-right"></div>
                  <div className={`absolute left-0 md:relative md:left-auto flex items-center justify-center w-14 h-14 rounded-full border-4 ${currentStep >= 3 ? 'bg-blue-800 border-blue-100 text-white' : 'bg-white border-zinc-200 text-zinc-300'} z-10 shadow-sm transition-colors duration-500`}>
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className={`ml-20 md:ml-0 md:w-1/2 md:pl-12 ${currentStep >= 3 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    <h4 className="font-bold text-lg mb-1">Interview Scheduled</h4>
                    <p className="text-sm">You have been selected for an interview.</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex md:justify-center items-center">
                  <div className={`ml-20 md:ml-0 md:w-1/2 md:pr-12 text-left md:text-right ${currentStep >= 4 ? (isRejected ? 'text-red-600' : 'text-green-600') : 'text-zinc-400'}`}>
                    <h4 className="font-bold text-lg mb-1">{currentStep >= 4 ? (isRejected ? 'Application Closed' : 'Appointed') : 'Final Decision'}</h4>
                    <p className="text-sm">{currentStep >= 4 ? (isRejected ? 'Unfortunately, we are moving forward with other candidates.' : 'Congratulations! You are hired.') : 'Pending final outcome.'}</p>
                  </div>
                  <div className={`absolute left-0 md:relative md:left-auto flex items-center justify-center w-14 h-14 rounded-full border-4 ${currentStep >= 4 ? (isRejected ? 'bg-red-600 border-red-100 text-white' : 'bg-green-600 border-green-100 text-white') : 'bg-white border-zinc-200 text-zinc-300'} z-10 shadow-sm transition-colors duration-500`}>
                    {currentStep >= 4 && isRejected ? <XCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                  </div>
                  <div className="hidden md:block w-1/2 pl-12"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
