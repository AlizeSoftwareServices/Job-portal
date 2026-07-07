'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function ProfileLink() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string>('CANDIDATE');
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('skyo_token');
    setIsLoggedIn(!!token);
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        if (decoded.role) setRole(decoded.role);
      } catch (e) {
        console.error(e);
      }
    }
  }, [pathname]);

  if (!isLoggedIn) return null;

  const profileUrl = role === 'EMPLOYER' ? '/employer/dashboard' : '/profile';

  return (
    <Link href={profileUrl} className="text-blue-800 font-bold hover:text-blue-800 transition-colors">Profile</Link>
  );
}
