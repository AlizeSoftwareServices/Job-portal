import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Users, Target, Briefcase, FileSpreadsheet, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-blue-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#0B132B] text-white pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 mb-16 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-widest text-white">About Us</h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/40 text-blue-300 font-medium text-sm mb-6 border border-blue-800/50">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Leading Professional Recruitment
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Bridging the gap between <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Talent & Opportunity</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              At Skyo Consultancy, we specialize in delivering comprehensive manpower solutions, 
              connecting exceptional candidates with the world's top employers through permanent, contract, and temporary placements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/jobs" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center gap-2 group w-full sm:w-auto justify-center">
                Find Your Next Job
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#footer" className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all border border-white/10 w-full sm:w-auto text-center">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] transform rotate-3 scale-105 opacity-50 blur-xl"></div>
            <img 
              src="/about-hero.png" 
              alt="Skyo Consultancy Professional Team" 
              className="relative rounded-[2rem] w-full h-[350px] md:h-[450px] object-cover shadow-2xl border border-white/10"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Trusted by</p>
                <p className="text-zinc-900 font-black">Top Employers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nature of Business (Services) */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-blue-800 font-bold tracking-widest uppercase text-sm mb-3">Our Core Expertise</h2>
            <h3 className="text-3xl md:text-4xl font-black text-zinc-900 mb-6">Nature of Business</h3>
            <p className="text-lg text-zinc-600 leading-relaxed">
              We offer end-to-end recruitment and human resource solutions designed to scale your business and empower your career trajectory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-blue-600">
                <Users className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 mb-3">Manpower Consultancy Services</h4>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Strategic workforce planning and consulting to ensure your organization has the right talent mix to achieve its goals efficiently.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-indigo-600">
                <Target className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 mb-3">Recruitment & Placement</h4>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Precision-driven sourcing and placement services. We meticulously match candidates' skills and aspirations with employer requirements.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-amber-500">
                <Briefcase className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 mb-3">Staffing Solutions</h4>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Flexible staffing models including temporary, contract-to-hire, and permanent positions to adapt to dynamic market demands.
              </p>
            </div>

            {/* Service 4 */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-emerald-600">
                <FileSpreadsheet className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 mb-3">HR Consultancy & Payroll</h4>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Comprehensive HR support and seamless payroll processing, allowing you to focus on your core business operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#0B132B] rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1 text-center lg:text-left text-white">
                <h3 className="text-3xl md:text-4xl font-black mb-6">Why Choose Skyo?</h3>
                <p className="text-zinc-300 text-lg leading-relaxed mb-8">
                  We don't just fill vacancies; we build futures. Our deep industry insights, ethical practices, and commitment to social awareness set us apart in the competitive recruitment landscape.
                </p>
                <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-[#0B132B] px-8 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                  Join Our Network
                </Link>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-white text-center sm:text-left">
                   <Zap className="w-8 h-8 text-amber-400 mb-4 mx-auto sm:mx-0" />
                   <h5 className="font-bold text-lg mb-2">Fast Turnaround</h5>
                   <p className="text-sm text-zinc-400">Rapid deployment of qualified candidates to meet urgent needs.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-white text-center sm:text-left">
                   <ShieldCheck className="w-8 h-8 text-green-400 mb-4 mx-auto sm:mx-0" />
                   <h5 className="font-bold text-lg mb-2">Ethical Practices</h5>
                   <p className="text-sm text-zinc-400">Strict adherence to zero-cost job seeking and anti-child labour laws.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-white text-center sm:text-left sm:col-span-2">
                   <Award className="w-8 h-8 text-blue-400 mb-4 mx-auto sm:mx-0" />
                   <h5 className="font-bold text-lg mb-2">Industry Expertise</h5>
                   <p className="text-sm text-zinc-400">Specialized teams for IT, Non-IT, Manufacturing, and Healthcare sectors.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
