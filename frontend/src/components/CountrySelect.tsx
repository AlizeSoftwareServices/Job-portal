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
        className="w-full flex items-center justify-between border border-zinc-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm transition-shadow"
      >
        <span className="flex items-center gap-2">
          {selectedCountry && (
            <img 
              src={`https://flagcdn.com/w20/${selectedCountry.code}.png`} 
              alt={selectedCountry.name}
              className="w-5 h-auto rounded-sm object-cover shadow-sm"
            />
          )}
          <span>{selectedCountry?.dialCode}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-zinc-100">
            <input 
              type="text" 
              placeholder="Search country..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <ul className="py-1">
            {filteredCountries.map(c => (
              <li 
                key={c.code}
                onClick={() => { onChange(c.dialCode); setIsOpen(false); setSearch(''); }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 cursor-pointer text-sm"
              >
                <img 
                  src={`https://flagcdn.com/w20/${c.code}.png`} 
                  alt={c.name}
                  className="w-5 h-auto rounded-sm object-cover shadow-sm"
                />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-zinc-500">{c.dialCode}</span>
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="px-3 py-2 text-sm text-zinc-500 text-center">No countries found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
