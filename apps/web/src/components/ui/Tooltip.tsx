'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';

// Tooltip variants
const tooltipVariants = cva(
  'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg shadow-lg border border-white/10',
  {
    variants: {
      placement: {
        top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
        bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
        left: '-left-2 top-1/2 -translate-x-full -translate-y-1/2',
        right: '-right-2 top-1/2 translate-x-full -translate-y-1/2',
        'top-start': '-top-2 left-0 -translate-y-full',
        'top-end': '-top-2 right-0 -translate-y-full',
        'bottom-start': '-bottom-2 left-0 translate-y-full',
        'bottom-end': '-bottom-2 right-0 translate-y-full',
      },
      variant: {
        default: 'bg-slate-900 border-white/10',
        primary: 'bg-gradient-to-br from-primary-500 to-primary-700 border-primary-400',
        secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-700 border-secondary-400',
        neon: 'bg-black border-neon-cyan shadow-[0_0_20px_rgba(0,245,255,0.5)]',
        glass: 'backdrop-blur-xl bg-white/10 border-white/20',
      },
    },
    defaultVariants: {
      placement: 'top',
      variant: 'default',
    },
  }
);

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: React.ReactNode;
  children: React.ReactElement;
  delayDuration?: number;
  disabled?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement,
  variant,
  delayDuration = 500,
  disabled = false,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (disabled) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delayDuration);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(tooltipVariants({ placement, variant }), className)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              zIndex: 9999,
            }}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 rotate-45 border-white/10',
                {
                  // Top placement
                  'top-full left-1/2 -translate-x-1/2 -mt-1 border-t border-r':
                    placement === 'top' || placement === 'top-start' || placement === 'top-end',
                  // Bottom placement
                  'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b border-l':
                    placement === 'bottom' ||
                    placement === 'bottom-start' ||
                    placement === 'bottom-end',
                  // Left placement
                  'left-full top-1/2 -translate-y-1/2 -ml-1 border-l border-b':
                    placement === 'left',
                  // Right placement
                  'right-full top-1/2 -translate-y-1/2 -mr-1 border-r border-b':
                    placement === 'right',
                }
              )}
              style={{
                backgroundColor: variant === 'primary'
                  ? 'rgb(37 99 235)'
                  : variant === 'secondary'
                  ? 'rgb(168 85 247)'
                  : 'rgb(15 23 42)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
