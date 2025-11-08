'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';

// Progress variants
const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-slate-700',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
        xl: 'h-6',
      },
      variant: {
        default: 'bg-slate-700',
        primary: 'bg-slate-800',
        secondary: 'bg-slate-800',
        glass: 'bg-white/20',
        neon: 'bg-black/50',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const progressBarVariants = cva(
  'h-full rounded-full transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-500 to-primary-600',
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
        secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
        success: 'bg-gradient-to-r from-success-500 to-success-600',
        warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
        error: 'bg-gradient-to-r from-error-500 to-error-600',
        neon: 'bg-gradient-to-r from-neon-cyan to-neon-lime',
        rainbow: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400',
        glass: 'bg-gradient-to-r from-white/40 to-white/60',
      },
      animated: {
        none: '',
        pulse: 'animate-pulse',
        glow: 'shadow-glow',
        shimmer: 'relative overflow-hidden',
        wave: 'animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: 'none',
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  size,
  variant,
  animated,
  striped = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const progressBar = (
    <motion.div
      className={progressBarVariants({ variant, animated })}
      style={{ width: `${percentage}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {striped && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"
          style={{
            backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
    </motion.div>
  );

  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-white">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-slate-400">
              {value}{max !== 100 ? `/${max}` : '%'}
            </span>
          )}
        </div>
      )}
      <div
        className={progressVariants({ size, variant, className })}
        {...props}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {progressBar}
      </div>
    </div>
  );
};

// Circular progress
export interface CircularProgressProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  label?: string;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showValue = false,
  label,
  variant,
  animated = 'pulse',
  children,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        {...props}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            progressBarVariants({ variant, animated }),
            'transition-all duration-1000 ease-out'
          )}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          style={{
            filter: animated === 'glow' ? 'drop-shadow(0 0 6px currentColor)' : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(percentage)}%
            </div>
            {label && (
              <div className="text-xs text-slate-400">{label}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Multi-step progress
export interface Step {
  label: string;
  completed?: boolean;
  active?: boolean;
}

export interface MultiStepProgressProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex',
        {
          'flex-row space-x-4': orientation === 'horizontal',
          'flex-col space-y-4': orientation === 'vertical',
        },
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = step.completed || index < currentStep;
        const isActive = step.active || index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div
            key={index}
            className={cn(
              'flex items-center',
              {
                'flex-col text-center': orientation === 'horizontal',
                'flex-row': orientation === 'vertical',
              }
            )}
          >
            {/* Step circle */}
            <div className="relative flex-shrink-0">
              <motion.div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                  {
                    'bg-success-500 text-white': isCompleted,
                    'bg-primary-500 text-white': isActive,
                    'bg-slate-700 text-slate-400': isUpcoming,
                  }
                )}
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isActive ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {isCompleted ? (
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
            </div>

            {/* Step label */}
            <div
              className={cn(
                'ml-3 text-sm font-medium',
                {
                  'mt-2 ml-0': orientation === 'horizontal',
                  'ml-3': orientation === 'vertical',
                  'text-white': isCompleted || isActive,
                  'text-slate-400': isUpcoming,
                }
              )}
            >
              {step.label}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 bg-slate-700',
                  {
                    'w-4 mx-4 mt-2': orientation === 'horizontal',
                    'h-4 w-0.5 my-2 ml-5': orientation === 'vertical',
                  }
                )}
              >
                {isCompleted && (
                  <motion.div
                    className="h-full bg-success-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Progress;
