import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="footer" className="bg-sky-800 text-sky-200 py-16 px-6 border-t border-sky-900/50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Branding & About */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <img src="/logo.png" alt="Skyo Consultancy Logo" className="h-20 w-auto bg-white rounded-md p-2 object-contain" />
            </div>
          </div>
          <p className="text-sm leading-relaxed mb-6 text-sky-200">
            Skyo consultancy is a leading professional recruitment consultancy Specialising in the recruitment of permanent, contract & temporary positions on behalf of the world's top clients.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center hover:bg-sky-800 hover:text-white transition-all text-sky-200 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all text-sky-200 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all text-sky-200 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2">
          <h4 className="text-white font-semibold mb-4 text-lg">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-2"><span className="text-amber-500 text-xs">▹</span> Home</Link></li>
            <li><Link href="/jobs" className="hover:text-amber-500 transition-colors flex items-center gap-2"><span className="text-amber-500 text-xs">▹</span> Find Jobs</Link></li>
            <li><Link href="/about" className="hover:text-amber-500 transition-colors flex items-center gap-2"><span className="text-amber-500 text-xs">▹</span> About Us</Link></li>
            <li><Link href="#footer" className="hover:text-amber-500 transition-colors flex items-center gap-2"><span className="text-amber-500 text-xs">▹</span> Contact</Link></li>
          </ul>
        </div>

        {/* Social Awareness */}
        <div className="lg:col-span-4 lg:pr-4">
          <h4 className="text-white font-semibold mb-4 text-lg">Social Awareness</h4>
          <ul className="space-y-3 text-sm text-sky-200">
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Against child labour</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Childhood’s for learning not for earning</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Refer and earn</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Jobs for everyone</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold">✓</span> Should not get any money from job seekers</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="lg:col-span-3">
          <h4 className="text-white font-semibold mb-4 text-lg">Contact Us</h4>
          <ul className="space-y-4 text-sm text-sky-200">
            <li className="flex items-start gap-3">
              <div className="w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <span className="leading-relaxed">F2 Sanjeevi flats, 7/12 Arumugam Street,<br />Pazhavanthangal, Kancheepuram,<br />Tamilnadu-600114</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <a href="tel:+918610656537" className="hover:text-amber-500 transition-colors">8610 6565 37</a>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <a href="mailto:support@skyoconsultancy.com" className="hover:text-amber-500 transition-colors break-all">support@skyoconsultancy.com</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto border-t border-zinc-800 mt-12 pt-8 text-sm text-center">
        &copy; {new Date().getFullYear()} SkyoConsultancy Inc. All rights reserved.
      </div>
    </footer>
  );
}
