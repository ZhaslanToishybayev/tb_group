import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950',
  {
    variants: {
      variant: {
        default: 'border-brand-500/40 bg-brand-500/10 text-brand-200',
        success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200',
        warning: 'border-amber-500/30 bg-amber-500/15 text-amber-200',
        destructive: 'border-rose-500/30 bg-rose-600/15 text-rose-200',
        outline: 'border-slate-700 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);

Badge.displayName = 'Badge';
