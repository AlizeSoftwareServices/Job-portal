import { useState, useRef, useEffect } from 'react';
import { countries } from '../lib/countries';
import { ChevronDown } from 'lucide-react';

export default function CountrySelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find(c => c.dialCode === value) || countries.find(c => c.dialCode === '+91');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.dialCode.includes(search)
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-zinc-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-sky-500 outline-none bg-white text-zinc-900 text-sm transition-shadow font-medium"
      >
        <span className="flex items-center gap-2">
          {selectedCountry && (
            <img 
              src={`https://flagcdn.com/w20/${selectedCountry.code}.png`} 
              alt={selectedCountry.name}
              className="w-5 h-auto rounded-sm object-cover shadow-sm"
            />
          )}
          <span className="text-zinc-900 font-semibold">{selectedCountry?.dialCode}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-zinc-600" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 sm:w-72 bg-white border border-zinc-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-zinc-100 z-10">
            <input 
              type="text" 
              placeholder="Search country..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <ul className="py-1">
            {filteredCountries.map(c => (
              <li 
                key={c.code}
                onClick={() => { onChange(c.dialCode); setIsOpen(false); setSearch(''); }}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-sky-50 hover:text-sky-900 cursor-pointer text-sm transition-colors"
              >
                <img 
                  src={`https://flagcdn.com/w20/${c.code}.png`} 
                  alt={c.name}
                  className="w-5 h-auto rounded-sm object-cover shadow-sm shrink-0"
                />
                <span className="flex-1 truncate font-semibold text-zinc-900">{c.name}</span>
                <span className="text-zinc-600 font-mono text-xs font-bold">{c.dialCode}</span>
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-3 py-4 text-sm text-zinc-500 text-center font-medium">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
