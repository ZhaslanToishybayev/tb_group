'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';
import {
  hoverLift,
  hoverGlow,
  hoverScale,
  buttonHover
} from '../animations/variants';
import type { LucideIcon } from 'lucide-react';

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow hover:shadow-glow-lg hover:brightness-110',
        secondary:
          'bg-gradient-to-br from-secondary-500 to-secondary-700 text-white shadow-glow-purple hover:shadow-purple-lg hover:brightness-110',
        ghost:
          'bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30',
        neon:
          'bg-neon-cyan text-black font-bold shadow-[0_0_20px_rgba(0,245,255,0.6)] hover:shadow-[0_0_30px_rgba(0,245,255,0.8)] hover:scale-105',
        gradient:
          'bg-gradient-to-r from-primary-500 via-secondary-500 to-neon-cyan text-white shadow-glow hover:shadow-glow-lg hover:scale-105',
        outline:
          'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500 hover:text-white',
        success:
          'bg-gradient-to-br from-success-500 to-success-600 text-white shadow-lg hover:shadow-xl hover:brightness-110',
        warning:
          'bg-gradient-to-br from-warning-500 to-warning-600 text-white shadow-lg hover:shadow-xl hover:brightness-110',
        error:
          'bg-gradient-to-br from-error-500 to-error-600 text-white shadow-lg hover:shadow-xl hover:brightness-110',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-13 px-8 text-lg',
        xl: 'h-15 px-10 text-xl',
        icon: 'h-10 w-10',
      },
      glow: {
        none: '',
        small: 'shadow-glow-sm',
        medium: 'shadow-glow',
        large: 'shadow-glow-lg',
        neon: 'shadow-[0_0_20px_rgba(0,245,255,0.6)]',
        purple: 'shadow-glow-purple',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      glow: 'none',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  leftIconClassName?: string;
  rightIconClassName?: string;
}

// Ripple effect component
const Ripple = ({ x, y }: { x: number; y: number }) => (
  <motion.span
    className="absolute rounded-full bg-white/30 pointer-events-none"
    style={{
      left: x - 10,
      top: y - 10,
      width: 20,
      height: 20,
    }}
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 4, opacity: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  />
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      loading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      leftIconClassName = '',
      rightIconClassName = '',
      children,
      disabled,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onDragStart,
      onDrag,
      onDragEnd,
      onMouseEnter,
      onMouseLeave,
      onTouchStart,
      onTouchEnd,
      ...restProps
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    const [rippleId, setRippleId] = React.useState(0);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Don't show ripple if loading or disabled
      if (loading || disabled) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = { id: rippleId, x, y };
      setRipples((prev) => [...prev, newRipple]);
      setRippleId((id) => id + 1);

      // Clean up ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);

      restProps.onClick?.(e);
    };

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, glow, className }))}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        whileHover="hover"
        whileTap="tap"
        variants={buttonHover}
        {...restProps}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <Ripple key={ripple.id} x={ripple.x} y={ripple.y} />
        ))}

        {/* Loading spinner */}
        {loading && (
          <motion.svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
        )}

        {/* Left icon */}
        {LeftIcon && !loading && (
          <motion.span
            className={cn('mr-2', leftIconClassName)}
            variants={{
              hover: { x: -2 },
              tap: { x: 0 },
            }}
          >
            <LeftIcon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
          </motion.span>
        )}

        {/* Content */}
        <span className="relative z-10">{children}</span>

        {/* Right icon */}
        {RightIcon && (
          <motion.span
            className={cn('ml-2', rightIconClassName)}
            variants={{
              hover: { x: 2 },
              tap: { x: 0 },
            }}
          >
            <RightIcon size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} />
          </motion.span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Preset button variants for convenience
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
);

export const NeonButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="neon" {...props} />
);

export const GradientButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="gradient" {...props} />
);

export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props} />
);

export const SuccessButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="success" {...props} />
);

export const WarningButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="warning" {...props} />
);

export const ErrorButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="error" {...props} />
);

export default Button;
