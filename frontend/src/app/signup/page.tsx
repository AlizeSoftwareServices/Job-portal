'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Loader2, Building2, User } from 'lucide-react';
import CountrySelect from '../../components/CountrySelect';

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = role, 1 = details, 2 = otp
  const [role, setRole] = useState<'CANDIDATE' | 'EMPLOYER'>('CANDIDATE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
     
    
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    companyName: '',
    secondaryContactNumber: '',
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };

  const validatePhone = (phone: string, code: string) => {
    // Basic validation, depending on country code
    if (code === '+91' && phone.length !== 10) return false;
    if (phone.length < 7 || phone.length > 15) return false;
    return /^\d+$/.test(phone);
  };

  const getPhoneMaxLength = (code: string) => {
    if (code === '+91') return 10;
    if (code === '+1') return 10;
    if (code === '+44') return 11;
    if (code === '+61') return 9;
    return 15;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      return setError('Please enter a valid email address.');
    }
    if (!validatePhone(formData.phone, formData.countryCode)) {
      return setError('Please enter a valid phone number for the selected country.');
    }
    if (!validatePassword(formData.password)) {
      return setError('Password must be at least 8 characters, include an uppercase, a lowercase, a number, and a special character.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (role === 'EMPLOYER' && formData.phone === formData.secondaryContactNumber && formData.phone.trim() !== '') {
      return setError('Primary Contact Number and Secondary Contact Number must be different.');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (!res.ok) {
        const text = await res.text();
        let message = 'Failed to send OTP';
        try {
          message = JSON.parse(text).message;
        } catch {
          message = `Server Error: ${text.substring(0, 50)}`;
        }
        throw new Error(message);
      }

      await res.json();
      setStep(2); // Move to OTP step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          countryCode: formData.countryCode,
          phone: formData.phone,
          password: formData.password,
          otp: formData.otp,
          role: role,
          ...(role === 'EMPLOYER' && {
            companyName: formData.companyName,
            secondaryContactNumber: formData.secondaryContactNumber
          })
        })
      });

      if (!res.ok) {
        const text = await res.text();
        let message = 'Verification failed';
        try { message = JSON.parse(text).message; } catch { message = text.substring(0, 50); }
        throw new Error(message);
      }
      
      const data = await res.json();

      // Save token and redirect
      localStorage.setItem('skyo_token', data.token);
      if (data.user?.role === 'EMPLOYER') {
        router.push('/employer/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <style>{`
        @keyframes loadingBarSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loadingBarSlide 1.5s infinite linear;
        }
      `}</style>
      <div className="min-h-screen bg-zinc-50 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
        {loading && (
          <div className="fixed top-0 left-0 w-full h-1.5 bg-green-100 z-50 overflow-hidden">
            <div className="h-full w-full bg-green-500 animate-loading-bar rounded-r-full shadow-[0_0_10px_#22c55e]"></div>
          </div>
        )}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="flex items-center text-sm font-medium text-zinc-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </button>
        ) : (
          <Link href="/" className="flex items-center text-sm font-medium text-zinc-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Link>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 mt-10 md:mt-0">
        <Link href="/" className="text-3xl font-bold tracking-tight text-blue-900 inline-block">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-24 md:h-32 w-auto object-contain mix-blend-multiply" />
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-zinc-900">
          {step === 0 ? 'Create your account' : `Create ${role === 'EMPLOYER' ? 'Employer' : 'Candidate'} account`}
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-zinc-200">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {step === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <button 
                onClick={() => { setRole('EMPLOYER'); setStep(1); }}
                className="p-6 border border-zinc-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 bg-white"
              >
                <div className="bg-blue-50 p-4 rounded-full">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg text-zinc-800">Employer</h3>
                <p className="text-sm text-zinc-500 text-center">I want to hire talent</p>
              </button>

              <button 
                onClick={() => { setRole('CANDIDATE'); setStep(1); }}
                className="p-6 border border-zinc-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 bg-white"
              >
                <div className="bg-amber-50 p-4 rounded-full">
                  <User className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg text-zinc-800">Candidate</h3>
                <p className="text-sm text-zinc-500 text-center">I want to find a job</p>
              </button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              {role === 'EMPLOYER' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Company Name</label>
                    <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">First name</label>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Last name</label>
                    <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail id</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">{role === 'EMPLOYER' ? 'Primary Contact Number' : 'Mobile Number'}</label>
                <div className="flex gap-2">
                  <div className="w-32 shrink-0">
                    <CountrySelect 
                      value={formData.countryCode} 
                      onChange={(val: string) => setFormData({...formData, countryCode: val})} 
                    />
                  </div>
                  <input 
                    required 
                    type="tel" 
                    maxLength={getPhoneMaxLength(formData.countryCode)}
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})} 
                    className="flex-1 border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none min-w-0" 
                    placeholder="Phone Number" 
                  />
                </div>
              </div>

              {role === 'EMPLOYER' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Secondary Contact Number</label>
                  <div className="flex gap-2">
                    <div className="w-32 shrink-0">
                      <CountrySelect 
                        value={formData.countryCode} 
                        onChange={(val: string) => setFormData({...formData, countryCode: val})} 
                      />
                    </div>
                    <input 
                      required
                      type="tel" 
                      maxLength={getPhoneMaxLength(formData.countryCode)}
                      value={formData.secondaryContactNumber} 
                      onChange={e => setFormData({...formData, secondaryContactNumber: e.target.value.replace(/[^0-9]/g, '')})} 
                      className="flex-1 border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none min-w-0" 
                      placeholder="Phone Number" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Create Password</label>
                <div className="relative">
                  <input required type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input required type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Verification OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-sm text-zinc-600">We've sent a 6-digit verification code to</p>
                <p className="font-bold text-zinc-800">{formData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Enter OTP</label>
                <input required type="text" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-center tracking-[0.5em] text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="------" />
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-700 disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Create Account'}
              </button>
              
              <div className="text-center mt-4">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-800 hover:underline">Change Email</button>
              </div>
            </form>
          )}

          {step === 0 && (
            <p className="mt-6 text-center text-sm text-zinc-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-800 hover:text-amber-500">
                Sign in
              </Link>
            </p>
          )}

          {step === 1 && (
            <div className="text-center mt-6">
              <button type="button" onClick={() => setStep(0)} className="text-sm text-zinc-500 hover:text-zinc-800">
                &larr; Change Role
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
