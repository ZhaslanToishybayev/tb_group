'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './Button';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  className?: string;
}

const themes: { value: Theme; icon: React.ComponentType<any>; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle({ theme = 'system', onThemeChange, className }: ThemeToggleProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className}>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
      >
        {theme === 'light' && <Sun className="h-5 w-5" />}
        {theme === 'dark' && <Moon className="h-5 w-5" />}
        {theme === 'system' && <Monitor className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            className="absolute right-0 mt-2 w-36 rounded-xl bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-xl z-50 p-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  onThemeChange?.(value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === value
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
