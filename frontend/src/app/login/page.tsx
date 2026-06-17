'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSignUpPrompt(false);
    setLoading(true);

    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 404 || data.message?.includes('not found')) {
          setShowSignUpPrompt(true);
        }
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('skyo_token', data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <Link href="/" className="flex items-center text-sm font-medium text-zinc-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 mt-10 md:mt-0">
        <Link href="/" className="text-3xl font-bold tracking-tight text-blue-900 inline-block">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-24 md:h-32 w-auto object-contain mix-blend-multiply" />
          </div>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-zinc-900">
          Sign in to your account
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-zinc-200">
          
          {error && !showSignUpPrompt && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {showSignUpPrompt && (
            <div className="mb-6 p-4 bg-orange-50 text-orange-800 text-sm rounded-lg border border-orange-200 flex flex-col items-center text-center">
              <span className="font-bold mb-2 text-orange-900">Account Not Found!</span>
              <span>It looks like you don't have an account with us.</span>
              <Link href="/signup" className="mt-3 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                Register Now
              </Link>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@example.com" />
            </div>

            <div>
              <div className="mb-1">
                <label className="block text-sm font-medium text-zinc-700">Password</label>
              </div>
              <div className="relative mb-2">
                <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm font-medium text-blue-800 hover:text-amber-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-800 hover:text-amber-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
