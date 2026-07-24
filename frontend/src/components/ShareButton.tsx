'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ title, text, url }: { title: string, text: string, url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating if it's inside a Link
    e.stopPropagation(); // Prevent triggering parent onClick events
    
    // Construct full URL if a relative path is passed
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: fullUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API (e.g. some desktop browsers)
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy!', err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="p-2 rounded-full bg-sky-50 hover:bg-amber-50 text-sky-800 transition-colors flex items-center justify-center group relative z-10"
      title="Share this job"
      aria-label="Share this job"
    >
      <Share2 className="h-4 w-4" />
      {copied && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap">
          Link copied!
        </span>
      )}
    </button>
  );
}
