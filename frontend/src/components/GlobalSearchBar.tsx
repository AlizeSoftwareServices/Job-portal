'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function GlobalSearchBar({
  initialQ = '',
  initialLoc = '',
  onSearch
}: {
  initialQ?: string;
  initialLoc?: string;
  onSearch?: (searchData: { q: string, loc: string }) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [titleQuery, setTitleQuery] = useState(initialQ || searchParams?.get('q') || '');
  const [locQuery, setLocQuery] = useState(initialLoc || searchParams?.get('loc') || '');
  
  const [allTitles, setAllTitles] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [locSuggestions, setLocSuggestions] = useState<string[]>([]);
  
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showLocDropdown, setShowLocDropdown] = useState(false);

  const titleDropdownRef = useRef<HTMLDivElement>(null);
  const locDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`\${'/api'}/jobs`);
        if (res.ok) {
          const jobs = await res.json();
          const titles = Array.from(new Set(jobs.map((j: any) => j.title))) as string[];
          
          const locations = new Set<string>();
          jobs.forEach((j: any) => {
            if (j.locationCity && j.locationState) {
              locations.add(`${j.locationCity}, ${j.locationState}`);
            } else if (j.locationCity) {
              locations.add(j.locationCity);
            } else if (j.locationState) {
              locations.add(j.locationState);
            }
          });
          
          setAllTitles(titles);
          setAllLocations(Array.from(locations));
        }
      } catch (err) {
        console.error('Failed to fetch jobs for autocomplete', err);
      }
    };
    fetchJobs();

    const handleClickOutside = (e: MouseEvent) => {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(e.target as Node)) {
        setShowTitleDropdown(false);
      }
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target as Node)) {
        setShowLocDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitleQuery(val);
    
    if (val.trim() === '') {
      setTitleSuggestions([]);
      setShowTitleDropdown(false);
      if (pathname !== '/') {
        executeSearch('', locQuery); // Automatically update when cleared only on jobs page
      }
      return;
    }

    const lowerVal = val.toLowerCase();
    const matches = allTitles.filter(title => title.toLowerCase().includes(lowerVal));
    setTitleSuggestions(matches);
    setShowTitleDropdown(true);
  };

  const handleLocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocQuery(val);
    
    if (val.trim() === '') {
      setLocSuggestions([]);
      setShowLocDropdown(false);
      if (pathname !== '/') {
        executeSearch(titleQuery, ''); // Automatically update when cleared only on jobs page
      }
      return;
    }

    const lowerVal = val.toLowerCase();
    const matches = allLocations.filter(loc => loc.toLowerCase().includes(lowerVal));
    setLocSuggestions(matches);
    setShowLocDropdown(true);
  };

  const executeSearch = (q: string, loc: string) => {
    if (onSearch) {
      onSearch({ q, loc });
    } else {
      const params = new URLSearchParams();
      if (q.trim()) params.append('q', q.trim());
      if (loc.trim()) params.append('loc', loc.trim());
      router.push(`/jobs?${params.toString()}`);
    }
  };

  const handleTitleSelect = (title: string) => {
    setTitleQuery(title);
    setShowTitleDropdown(false);
  };

  const handleLocSelect = (loc: string) => {
    setLocQuery(loc);
    setShowLocDropdown(false);
  };

  const validateAndSearch = () => {
    const isTitleValid = !titleQuery.trim() || allTitles.some(t => t.toLowerCase() === titleQuery.trim().toLowerCase());
    const isLocValid = !locQuery.trim() || allLocations.some(l => l.toLowerCase() === locQuery.trim().toLowerCase());

    if (!isTitleValid || !isLocValid) {
      alert("Please choose a valid role and location from the suggestions.");
      return;
    }

    executeSearch(titleQuery, locQuery);
  };

  const handleSearchClick = () => {
    setShowTitleDropdown(false);
    setShowLocDropdown(false);
    validateAndSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: 'title' | 'loc') => {
    if (e.key === 'Enter') {
      setShowTitleDropdown(false);
      setShowLocDropdown(false);
      validateAndSearch();
    }
  };

  return (
    <div className="bg-white p-2 md:p-3 rounded-2xl w-full flex flex-col md:flex-row gap-2 shadow-lg border border-zinc-200 transition-all hover:shadow-xl">
      {/* Title Search */}
      <div className="flex-1 relative" ref={titleDropdownRef}>
        <div className="flex items-center bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-200 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all h-full">
          <Search className="text-zinc-400 h-5 w-5 mr-3 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Job title, keywords, or role" 
            className="bg-transparent border-none outline-none w-full text-zinc-900 placeholder:text-zinc-500"
            value={titleQuery}
            onChange={handleTitleChange}
            onFocus={() => titleQuery.trim() && setTitleSuggestions(allTitles.filter(t => t.toLowerCase().includes(titleQuery.toLowerCase())))}
            onKeyDown={(e) => handleKeyDown(e, 'title')}
          />
        </div>
        {showTitleDropdown && titleSuggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-50">
            <ul className="max-h-60 overflow-y-auto">
              {titleSuggestions.map((title, idx) => (
                <li 
                  key={idx}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-zinc-800 transition-colors border-b border-zinc-50 last:border-b-0 flex items-center"
                  onClick={() => handleTitleSelect(title)}
                >
                  <Search className="text-zinc-400 h-4 w-4 mr-3 flex-shrink-0" />
                  {title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Location Search */}
      <div className="flex-1 relative" ref={locDropdownRef}>
        <div className="flex items-center bg-zinc-50 rounded-lg px-4 py-3 border border-zinc-200 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all h-full">
          <MapPin className="text-zinc-400 h-5 w-5 mr-3 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="City or state" 
            className="bg-transparent border-none outline-none w-full text-zinc-900 placeholder:text-zinc-500"
            value={locQuery}
            onChange={handleLocChange}
            onFocus={() => locQuery.trim() && setLocSuggestions(allLocations.filter(l => l.toLowerCase().includes(locQuery.toLowerCase())))}
            onKeyDown={(e) => handleKeyDown(e, 'loc')}
          />
        </div>
        {showLocDropdown && locSuggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-50">
            <ul className="max-h-60 overflow-y-auto">
              {locSuggestions.map((loc, idx) => (
                <li 
                  key={idx}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-zinc-800 transition-colors border-b border-zinc-50 last:border-b-0 flex items-center"
                  onClick={() => handleLocSelect(loc)}
                >
                  <MapPin className="text-zinc-400 h-4 w-4 mr-3 flex-shrink-0" />
                  {loc}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button 
        onClick={handleSearchClick}
        className="bg-blue-800 hover:bg-blue-700 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] flex items-center justify-center"
      >
        <Search className="h-5 w-5 mr-2" />
        Search
      </button>
    </div>
  );
}
