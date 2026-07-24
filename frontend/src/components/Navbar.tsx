'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import AuthButtons from './AuthButtons';
import ProfileLink from './ProfileLink';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="bg-white border-b border-zinc-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button className="md:hidden p-2 -ml-2 text-zinc-600" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex flex-col items-center">
            <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-12 md:h-16 w-auto object-contain mix-blend-multiply" />
            {pathname === '/profile' && (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 text-center">Candidate Portal</span>
            )}
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 font-medium text-zinc-600">
          <Link href="/" className="hover:text-sky-800 transition-colors">Home</Link>
          <Link href="/jobs" className="hover:text-sky-800 transition-colors">Find Jobs</Link>
          <Link href="/about" className="hover:text-sky-800 transition-colors">About Us</Link>
          <Link href="/#footer" className="hover:text-sky-800 transition-colors">Contact</Link>
          <ProfileLink />
        </div>

        <div className="hidden md:block">
          <AuthButtons />
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-zinc-100 flex justify-between items-start h-[100px] shrink-0">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
            {pathname === '/profile' && (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 text-center">Candidate Portal</span>
            )}
          </div>
          <button className="p-2 text-zinc-600 bg-zinc-100 rounded-full" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col py-4 px-4 gap-4 font-medium text-zinc-600 flex-1 overflow-y-auto">
          <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-sky-800 transition-colors p-2 rounded-lg hover:bg-zinc-50">Home</Link>
          <Link href="/jobs" onClick={() => setIsOpen(false)} className="hover:text-sky-800 transition-colors p-2 rounded-lg hover:bg-zinc-50">Find Jobs</Link>
          <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-sky-800 transition-colors p-2 rounded-lg hover:bg-zinc-50">About Us</Link>
          <Link href="/#footer" onClick={() => setIsOpen(false)} className="hover:text-sky-800 transition-colors p-2 rounded-lg hover:bg-zinc-50">Contact</Link>
          <div className="p-2" onClick={() => setIsOpen(false)}>
            <ProfileLink />
          </div>
          <div className="mt-auto pt-4 border-t border-zinc-100" onClick={() => setIsOpen(false)}>
            <AuthButtons />
          </div>
        </div>
      </div>
    </>
  );
}
