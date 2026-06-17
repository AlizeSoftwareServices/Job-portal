'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileLink() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('skyo_token'));
  }, [pathname]);

  if (!isLoggedIn) return null;

  return (
    <Link href="/profile" className="text-blue-800 font-bold hover:text-blue-800 transition-colors">Profile</Link>
  );
}
