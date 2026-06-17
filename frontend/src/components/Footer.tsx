import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#0B132B] text-zinc-400 py-16 px-6 border-t border-blue-900/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-20 w-auto bg-white rounded-md p-2 object-contain" />
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-6">
            Connecting talented professionals with India's top employers since 2026.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center hover:bg-blue-800 hover:text-white transition-all text-zinc-400 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all text-zinc-400 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/jobs" className="hover:text-white transition-colors">Find Jobs</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="#footer" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2 text-sm">
            <li>support@skyoconsultancy.com</li>
            <li>1800-123-4567</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-zinc-800 mt-12 pt-8 text-sm text-center">
        &copy; {new Date().getFullYear()} SkyoConsultancy Inc. All rights reserved.
      </div>
    </footer>
  );
}
