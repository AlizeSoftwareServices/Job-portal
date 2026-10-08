'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';

export default function FloatingContactButtons() {
  const pathname = usePathname();

  // Hide on admin portal to prevent overlapping admin panels/controls
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const phoneNumber = '+918610656537';
  const displayPhone = '+91 8610 6565 37';
  const whatsappUrl = `https://wa.me/918610656537?text=${encodeURIComponent('Hello Skyo Consultancy, I have an enquiry.')}`;

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Phone Call Button */}
      <div className="relative group flex items-center">
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
          Call {displayPhone}
        </span>
        <a
          href={`tel:${phoneNumber}`}
          aria-label={`Call Skyo Consultancy at ${displayPhone}`}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-900 hover:bg-sky-800 text-white flex items-center justify-center shadow-lg hover:shadow-xl shadow-sky-950/25 transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-white/20"
        >
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
        </a>
      </div>

      {/* WhatsApp Chat Button */}
      <div className="relative group flex items-center">
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
          Chat on WhatsApp
        </span>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Skyo Consultancy on WhatsApp"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-2xl shadow-green-600/30 transition-all duration-300 transform hover:scale-110 active:scale-95 border-2 border-white/30"
        >
          {/* WhatsApp SVG Icon */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.031 0C5.395 0 0 5.396 0 12.032c0 2.118.553 4.187 1.603 6.007L0 24l6.143-1.613a11.968 11.968 0 0 0 5.888 1.543h.005c6.634 0 12.03-5.396 12.03-12.033A12.008 12.008 0 0 0 12.031 0zm0 21.928h-.004a9.96 9.96 0 0 1-5.074-1.39l-.364-.216-3.771.989 1.006-3.676-.237-.377a9.92 9.92 0 0 1-1.528-5.226c0-5.503 4.478-9.982 9.983-9.982a9.94 9.94 0 0 1 7.059 2.926 9.94 9.94 0 0 1 2.925 7.057c0 5.505-4.48 9.984-9.986 9.984zm5.467-7.464c-.3-.15-1.774-.876-2.049-.976-.275-.1-.475-.15-.675.15s-.774.976-.949 1.176-.35.225-.65.075a8.214 8.214 0 0 1-2.417-1.492 9.06 9.06 0 0 1-1.674-2.083c-.175-.3-.019-.462.131-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525s-.675-1.625-.925-2.225c-.244-.585-.493-.505-.675-.515-.175-.01-.375-.01-.575-.01s-.525.075-.8.375c-.275.3-1.05 1.025-1.05 2.5s1.075 2.898 1.225 3.1c.15.2 2.115 3.23 5.123 4.53.715.31 1.273.495 1.708.633.718.228 1.372.196 1.889.119.577-.086 1.774-.726 2.024-1.426.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
