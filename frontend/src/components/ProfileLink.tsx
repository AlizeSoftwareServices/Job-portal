'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function ProfileLink({ onClick, className }: { onClick?: () => void, className?: string } = {}) {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [roleLabel, setRoleLabel] = useState<string>('Profile');
  const pathname = usePathname();

  useEffect(() => {
    const adminToken = localStorage.getItem('skyo_admin_token');
    const userToken = localStorage.getItem('skyo_token');

    // 1. Admin Token
    if (adminToken) {
      try {
        const decoded: any = jwtDecode(adminToken);
        if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('skyo_admin_token');
          setProfileUrl(null);
          return;
        }
        setProfileUrl('/admin');
        setRoleLabel('Admin Dashboard');
        return;
      } catch (e) {
        localStorage.removeItem('skyo_admin_token');
      }
    }

    // 2. Candidate or Employer Token
    if (userToken) {
      try {
        const decoded: any = jwtDecode(userToken);
        if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('skyo_token');
          setProfileUrl(null);
          return;
        }

        if (decoded.role === 'EMPLOYER') {
          setProfileUrl('/employer/dashboard');
          setRoleLabel('Employer Dashboard');
        } else {
          setProfileUrl('/profile');
          setRoleLabel('My Profile');
        }
        return;
      } catch (e) {
        localStorage.removeItem('skyo_token');
      }
    }

    // 3. Not logged in
    setProfileUrl(null);
  }, [pathname]);

  if (!profileUrl) return null;

  return (
    <Link 
      href={profileUrl} 
      onClick={onClick}
      className={className || "text-sky-800 font-bold hover:text-sky-900 transition-colors inline-flex items-center gap-1.5"}
    >
      {roleLabel}
    </Link>
  );
}
