'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from './Input';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'service' | 'case' | 'page';
  url: string;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  results = [],
  isLoading = false,
  className,
  placeholder = 'Поиск...',
}: SearchBarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      setIsOpen(true);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full rounded-xl bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-slate-400">Поиск...</div>
            ) : query && results.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                Ничего не найдено
              </div>
            ) : (
              <div className="py-2">
                {results.map((result) => (
                  <a
                    key={result.id}
                    href={result.url}
                    className="block px-4 py-3 hover:bg-white/5 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                        {result.type}
                      </span>
                    </div>
                    <div className="font-semibold text-white">{result.title}</div>
                    <div className="text-sm text-slate-400">{result.description}</div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
