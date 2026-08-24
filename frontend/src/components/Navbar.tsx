'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import AuthButtons from './AuthButtons';
import ProfileLink from './ProfileLink';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-zinc-200 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 transition-colors" onClick={() => setIsOpen(true)} aria-label="Open Menu">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/#home" onClick={(e) => handleNavClick(e, 'home')} className="flex flex-col items-center">
            <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-12 md:h-16 w-auto object-contain mix-blend-multiply" />
            {pathname === '/profile' && (
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 text-center">Candidate Portal</span>
            )}
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 font-medium text-zinc-600">
          <Link href="/#home" onClick={(e) => handleNavClick(e, 'home')} className="hover:text-sky-800 transition-colors">Home</Link>
          <Link href="/#jobs" onClick={(e) => handleNavClick(e, 'jobs')} className="hover:text-sky-800 transition-colors">Find Jobs</Link>
          <Link href="/#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-sky-800 transition-colors">About Us</Link>
          <Link href="/#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-sky-800 transition-colors">Contact</Link>
          <ProfileLink />
        </div>

        <div className="hidden md:block">
          <AuthButtons />
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[998] md:hidden overscroll-none backdrop-blur-xs transition-opacity" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 h-[100dvh] w-72 max-w-[82vw] bg-white shadow-2xl z-[999] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col overscroll-contain ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-zinc-100 flex justify-between items-center h-[80px] shrink-0">
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-9 w-auto object-contain mix-blend-multiply" />
            {pathname === '/profile' && (
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-left">Candidate Portal</span>
            )}
          </div>
          <button className="p-2 text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors" onClick={() => setIsOpen(false)} aria-label="Close Menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col py-4 px-4 gap-3 font-medium text-zinc-700 flex-1 overflow-y-auto">
          <Link href="/#home" onClick={(e) => handleNavClick(e, 'home')} className="hover:text-sky-800 transition-colors p-2.5 rounded-lg hover:bg-zinc-50 font-semibold">Home</Link>
          <Link href="/#jobs" onClick={(e) => handleNavClick(e, 'jobs')} className="hover:text-sky-800 transition-colors p-2.5 rounded-lg hover:bg-zinc-50 font-semibold">Find Jobs</Link>
          <Link href="/#about" onClick={(e) => handleNavClick(e, 'about')} className="hover:text-sky-800 transition-colors p-2.5 rounded-lg hover:bg-zinc-50 font-semibold">About Us</Link>
          <Link href="/#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-sky-800 transition-colors p-2.5 rounded-lg hover:bg-zinc-50 font-semibold">Contact</Link>
          <div className="p-2.5" onClick={() => setIsOpen(false)}>
            <ProfileLink />
          </div>
          <div className="mt-auto pt-4 border-t border-zinc-100 pb-6" onClick={() => setIsOpen(false)}>
            <AuthButtons />
          </div>
        </div>
      </div>
    </>
  );
}
