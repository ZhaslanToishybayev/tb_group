'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface ServiceFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: FilterOption[];
}

export function ServiceFilters({ activeFilter, onFilterChange, filters }: ServiceFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-12 justify-center">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <motion.button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              relative px-6 py-3 rounded-xl text-sm font-semibold transition-all
              ${isActive
                ? 'text-white'
                : 'text-slate-400 hover:text-white'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500"
                layoutId="activeFilter"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}

            {/* Hover Glow Effect */}
            <div
              className={`
                absolute inset-0 rounded-xl transition-opacity
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600/50 to-blue-500/50 opacity-100'
                  : 'bg-gradient-to-r from-white/5 to-white/0 opacity-0 hover:opacity-100'
                }
              `}
            />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {filter.label}
              {filter.count !== undefined && (
                <span
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-slate-300'
                    }
                  `}
                >
                  {filter.count}
                </span>
              )}
            </span>

            {/* Active Indicator */}
            {isActive && (
              <motion.div
                className="absolute -bottom-2 left-1/2 h-0.5 w-6 -translate-x-1/2 bg-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default ServiceFilters;
