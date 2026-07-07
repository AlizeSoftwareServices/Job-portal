'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function JobSearchAutocomplete() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allJobTitles, setAllJobTitles] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch all jobs to get their titles for autocomplete
    const fetchJobs = async () => {
      try {
        const res = await fetch(`/api/jobs`);
        if (res.ok) {
          const jobs = await res.json();
          // Extract unique titles
          const titles = Array.from(new Set(jobs.map((j: any) => j.title))) as string[];
          setAllJobTitles(titles);
        }
      } catch (err) {
        console.error('Failed to fetch jobs for autocomplete', err);
      }
    };
    fetchJobs();

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.trim() === '') {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const lowerVal = val.toLowerCase();
    // Match anywhere in the string
    const matches = allJobTitles.filter(title => title.toLowerCase().includes(lowerVal));
    setSuggestions(matches);
    setShowDropdown(true);
  };

  const handleSelect = (title: string) => {
    setQuery(title);
    setShowDropdown(false);
    // Trigger search
    handleSearch(title);
  };

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/jobs');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
      handleSearch();
    }
  };

  return (
    <div className="flex-1 relative" ref={dropdownRef}>
      <div className="flex items-center bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-200 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all h-full">
        <Search className="text-zinc-400 h-5 w-5 mr-3 flex-shrink-0" />
        <input 
          type="text" 
          placeholder="Job title, keywords, or role" 
          className="bg-transparent border-none outline-none w-full text-zinc-900 placeholder:text-zinc-500"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setSuggestions(allJobTitles.filter(t => t.toLowerCase().includes(query.toLowerCase())))}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-50">
          <ul className="max-h-60 overflow-y-auto">
            {suggestions.map((title, idx) => (
              <li 
                key={idx}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-zinc-800 transition-colors border-b border-zinc-50 last:border-b-0 flex items-center"
                onClick={() => handleSelect(title)}
              >
                <Search className="text-zinc-400 h-4 w-4 mr-3 flex-shrink-0" />
                {title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
