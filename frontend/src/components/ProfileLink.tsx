'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function ProfileLink() {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const adminToken = localStorage.getItem('skyo_admin_token');
    const userToken = localStorage.getItem('skyo_token');

    // Tokens are the true source of truth
    if (adminToken) {
      setProfileUrl('/admin');
      return;
    }

    if (userToken) {
      try {
        const decoded: any = jwtDecode(userToken);
        if (decoded.role === 'EMPLOYER') {
          setProfileUrl('/employer/dashboard');
        } else {
          setProfileUrl('/profile');
        }
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Not logged in anywhere
    setProfileUrl(null);
  }, [pathname]);

  if (!profileUrl) return null;

  return (
    <Link href={profileUrl} className="text-blue-800 font-bold hover:text-blue-800 transition-colors">Profile</Link>
  );
}
