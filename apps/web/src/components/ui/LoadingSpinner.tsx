'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/design/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'neon';
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const colorMap = {
  primary: 'text-primary-500',
  white: 'text-white',
  neon: 'text-neon-cyan',
};

export function LoadingSpinner({ size = 'md', className, color = 'primary' }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={cn('flex items-center justify-center', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.svg
        className={cn(sizeMap[size], colorMap[color])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </motion.svg>
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" color="primary" />
        <p className="mt-4 text-slate-400">Загрузка...</p>
      </div>
    </div>
  );
}

export function ButtonLoader({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <LoadingSpinner size={size} color="white" />;
}
