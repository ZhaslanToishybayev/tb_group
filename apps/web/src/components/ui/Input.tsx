'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';

// Input variants
const inputVariants = cva(
  'flex w-full rounded-xl border bg-slate-800/50 text-white placeholder:text-slate-400 transition-all duration-300 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-slate-600 hover:border-slate-500 focus:border-primary-500 focus:ring-primary-500/20',
        glass: 'border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/15 focus:border-white/30 focus:ring-white/20',
        gradient: 'border-primary-500/30 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 hover:border-primary-500/50 focus:border-primary-500 focus:ring-primary-500/20',
        neon: 'border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10 hover:border-neon-cyan/50 focus:border-neon-cyan focus:ring-neon-cyan/20',
        error: 'border-error-500 hover:border-error-400 focus:border-error-400 focus:ring-error-500/20',
        success: 'border-success-500 hover:border-success-400 focus:border-success-400 focus:ring-success-500/20',
      },
      size: {
        sm: 'h-10 px-3 text-sm',
        md: 'h-12 px-4 text-base',
        lg: 'h-14 px-5 text-lg',
      },
      state: {
        default: '',
        error: 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
        success: 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
        warning: 'border-warning-500 focus:border-warning-500 focus:ring-warning-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  required?: boolean;
}

// Animated Input component
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      size,
      state,
      label,
      error,
      success,
      warning,
      leftIcon,
      rightIcon,
      helperText,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.defaultValue || !!props.value);
    const inputId = id || React.useId();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const displayError = error;
    const displaySuccess = success;
    const displayWarning = warning;

    const inputState = displayError ? 'error' : displaySuccess ? 'success' : displayWarning ? 'warning' : state;

    const labelClassName = cn(
      // Floating label positioning
      'absolute left-3 transition-all duration-300 pointer-events-none',
      // Base label styles
      'text-slate-400',
      // Size-dependent positioning
      {
        'top-3': size === 'sm',
        'top-4': size === 'md',
        'top-5': size === 'lg',
      },
      // Active state - moves up when focused or has value
      {
        '-top-2 -left-1 scale-90 bg-slate-800 px-2 text-xs text-primary-400':
          isFocused || hasValue,
      },
      // Error state
      {
        'text-error-400': displayError,
      },
      // Success state
      {
        'text-success-400': displaySuccess,
      },
      // Warning state
      {
        'text-warning-400': displayWarning,
      }
    );

    const containerClassName = cn(
      'relative',
      {
        // Container styles for left icon
        'pl-10': leftIcon,
        // Container styles for right icon
        'pr-10': rightIcon,
      }
    );

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelClassName}>
            {label}
            {required && <span className="text-error-400 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className={containerClassName}>
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(inputVariants({ variant, size, state: inputState, className }))}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Right icon or validation indicator */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              {rightIcon}
            </div>
          )}

          {/* Success/Error/Warning indicator */}
          {!rightIcon && (displaySuccess || displayError || displayWarning) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {displaySuccess && (
                  <motion.svg
                    className="w-5 h-5 text-success-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
                {displayError && (
                  <motion.svg
                    className="w-5 h-5 text-error-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </motion.svg>
                )}
                {displayWarning && (
                  <motion.svg
                    className="w-5 h-5 text-warning-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </motion.svg>
                )}
              </motion.div>
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || displayError || displaySuccess || displayWarning) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'text-sm',
              {
                'text-slate-400': helperText && !displayError && !displaySuccess && !displayWarning,
                'text-error-400': displayError,
                'text-success-400': displaySuccess,
                'text-warning-400': displayWarning,
              }
            )}
          >
            {displayError || displaySuccess || displayWarning || helperText}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Preset variants
export const GlassInput = (props: Omit<InputProps, 'variant'>) => (
  <Input variant="glass" {...props} />
);

export const GradientInput = (props: Omit<InputProps, 'variant'>) => (
  <Input variant="gradient" {...props} />
);

export const NeonInput = (props: Omit<InputProps, 'variant'>) => (
  <Input variant="neon" {...props} />
);

export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon'>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      leftIcon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      placeholder="Search..."
      className={className}
      {...props}
    />
  )
);
SearchInput.displayName = 'SearchInput';

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        }
        className={className}
        {...props}
      />
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export default Input;
