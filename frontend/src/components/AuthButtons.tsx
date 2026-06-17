'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AuthButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('skyo_token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('skyo_token');
    setIsLoggedIn(false);
    router.push('/');
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3 md:gap-4 order-2 md:order-3 w-full md:w-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm md:text-base px-4 py-2.5 rounded-xl md:px-0 md:py-0 md:hover:bg-transparent w-full md:w-auto"
        >
          <LogOut className="h-4 w-4 md:h-5 md:w-5" /> 
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 md:gap-4 order-2 md:order-3">
      <Link href="/login" className="text-zinc-600 font-medium hover:text-blue-800 transition-colors text-sm md:text-base">Log In</Link>
      <Link href="/signup" className="bg-blue-700 hover:bg-blue-800 text-white px-4 md:px-5 py-2 rounded-full text-sm md:text-base font-medium transition-colors shadow-sm whitespace-nowrap">
        Sign Up
      </Link>
    </div>
  );
}
