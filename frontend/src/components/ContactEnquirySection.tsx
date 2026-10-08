'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock, MessageSquare } from 'lucide-react';

export default function ContactEnquirySection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || 'Thank you! Your enquiry has been submitted successfully.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setErrorMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Failed to submit enquiry. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="enquiry-form" className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 via-sky-50/40 to-sky-900/10 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mb-4">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700 font-semibold text-xs sm:text-sm tracking-wide uppercase">Have Any Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight font-serif mb-4">
            Get In Touch With <span className="text-amber-600">Skyo Consultancy</span>
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base md:text-lg leading-relaxed">
            Have an enquiry about job vacancies, placement assistance, or recruitment partnerships? Send us a message and our expert team will respond promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="bg-sky-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
              
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">Contact Information</h3>
              <p className="text-sky-200 text-xs sm:text-sm mb-6 sm:mb-8">Feel free to reach out directly through any of our official channels.</p>

              <div className="space-y-5 sm:space-y-6 text-sm sm:text-base">
                {/* Phone */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-wider text-sky-300 font-semibold mb-0.5">Phone Call</h4>
                    <a href="tel:+918610656537" className="text-white font-medium hover:text-amber-400 transition-colors block text-sm sm:text-base break-words">
                      +91 8610 6565 37
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-wider text-sky-300 font-semibold mb-0.5">Official Email</h4>
                    <a href="mailto:skyoconsultancy@gmail.com" className="text-white font-medium hover:text-amber-400 transition-colors block text-sm sm:text-base break-all">
                      skyoconsultancy@gmail.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-wider text-sky-300 font-semibold mb-0.5">Office Address</h4>
                    <p className="text-sky-100 text-xs sm:text-sm leading-relaxed break-words">
                      F2 Sanjeevi Flats, 7/12 Arumugam Street, Pazhavanthangal, Chennai - 600 061
                    </p>
                  </div>
                </div>

                {/* Timings */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-wider text-sky-300 font-semibold mb-0.5">Working Hours</h4>
                    <p className="text-sky-100 text-xs sm:text-sm">Monday – Saturday: 9:30 AM – 6:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 text-amber-900 flex items-start sm:items-center gap-3 sm:gap-4 shadow-sm">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="text-xs sm:text-sm text-zinc-700 leading-snug">
                <strong className="text-amber-800 font-semibold">100% Free Service for Job Seekers:</strong> We never charge any money or hidden fees from job candidates.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl border border-sky-100">
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2">Send Us an Enquiry</h3>
              <p className="text-zinc-500 text-xs sm:text-sm mb-6">
                Fill out the form below and our team will get back to you as soon as possible.
              </p>

              {successMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Submitted Successfully!</span>
                    <span>{successMsg}</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Submission Error</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Rahul Kumar"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-zinc-900 text-base sm:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-zinc-900 text-base sm:text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-zinc-900 text-base sm:text-sm outline-none transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Job Application / Employer Enquiry"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-zinc-900 text-base sm:text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 sm:mb-2">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Type your query or message here..."
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-zinc-900 text-base sm:text-sm outline-none transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-sky-800 hover:bg-sky-700 active:bg-sky-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Enquiry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
