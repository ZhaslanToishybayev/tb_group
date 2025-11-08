'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';

// Spinner variants
const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'w-4 h-4',
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
        '2xl': 'w-20 h-20',
      },
      variant: {
        default: 'text-white',
        primary: 'text-primary-500',
        secondary: 'text-secondary-500',
        neon: 'text-neon-cyan',
        success: 'text-success-500',
        warning: 'text-warning-500',
        error: 'text-error-500',
        gradient: 'bg-gradient-to-r from-primary-500 via-secondary-500 to-neon-cyan bg-clip-text text-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  label?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size, variant, label, className }) => {
  const spinnerContent = (
    <svg
      className={cn(spinnerVariants({ size, variant }), className)}
      fill="none"
      viewBox="0 0 24 24"
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
    </svg>
  );

  if (label) {
    return (
      <div className="flex items-center gap-3">
        {spinnerContent}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
    );
  }

  return spinnerContent;
};

// Dots spinner
export interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({ size = 'md', color = 'text-white', className }) => {
  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(dotSize, 'rounded-full', color)}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Pulse spinner
export interface PulseSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const PulseSpinner: React.FC<PulseSpinnerProps> = ({ size = 'md', color = 'text-primary-500', className }) => {
  const spinnerSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className={cn(spinnerSize, 'rounded-full', color)}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className={cn(spinnerSize, 'absolute inset-0 rounded-full', color)}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
    </div>
  );
};

// Bounce spinner
export interface BounceSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const BounceSpinner: React.FC<BounceSpinnerProps> = ({ size = 'md', color = 'text-primary-500', className }) => {
  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(dotSize, 'rounded-full', color)}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Wave spinner
export interface WaveSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const WaveSpinner: React.FC<WaveSpinnerProps> = ({ size = 'md', color = 'text-primary-500', className }) => {
  const barSize = {
    sm: 'w-1 h-4',
    md: 'w-1 h-6',
    lg: 'w-2 h-8',
  }[size];

  return (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn(barSize, 'rounded-full', color)}
          animate={{
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Ring spinner (material design style)
export interface RingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const RingSpinner: React.FC<RingSpinnerProps> = ({
  size = 'md',
  color = 'text-primary-500',
  strokeWidth = 4,
  className,
}) => {
  const spinnerSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className={cn(spinnerSize, className)}>
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={color.replace('text-', '')}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          animate={{
            strokeDashoffset: [31.416, 0],
            rotate: [0, 360],
          }}
          transition={{
            strokeDashoffset: { duration: 1.5, ease: 'easeInOut' },
            rotate: { duration: 1.5, ease: 'linear', repeat: Infinity },
          }}
        />
      </svg>
    </div>
  );
};

export default Spinner;
