import * as React from 'react';

import { cn } from './utils.js';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-xl bg-slate-800/60', className)}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';
