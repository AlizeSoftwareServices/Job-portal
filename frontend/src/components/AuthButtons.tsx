'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function AuthButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = () => {
    const userToken = localStorage.getItem('skyo_token');
    const adminToken = localStorage.getItem('skyo_admin_token');
    
    if (adminToken) {
      try {
        const decoded: any = jwtDecode(adminToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('skyo_admin_token');
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);
        return;
      } catch {
        localStorage.removeItem('skyo_admin_token');
      }
    }

    if (userToken) {
      try {
        const decoded: any = jwtDecode(userToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('skyo_token');
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);
        return;
      } catch {
        localStorage.removeItem('skyo_token');
      }
    }

    setIsLoggedIn(false);
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    localStorage.removeItem('skyo_token');
    localStorage.removeItem('skyo_admin_token');
    sessionStorage.removeItem('active_portal');
    setIsLoggedIn(false);
    router.push('/');
    window.location.href = '/';
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm px-4 py-2.5 rounded-xl border border-red-200 md:border-transparent md:px-3 md:py-1.5 md:hover:bg-red-50 w-full md:w-auto"
        >
          <LogOut className="h-4 w-4" /> 
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-2.5 w-full md:w-auto">
      <Link 
        href="/login" 
        className="w-full md:w-auto text-center text-zinc-700 font-bold hover:text-sky-800 transition-colors text-sm py-2 px-3 rounded-lg hover:bg-zinc-50"
      >
        Log In
      </Link>
      <Link 
        href="/signup" 
        className="w-full md:w-auto text-center bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
      >
        Sign Up
      </Link>
    </div>
  );
}
