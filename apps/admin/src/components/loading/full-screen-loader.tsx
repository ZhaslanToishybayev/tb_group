import React from 'react';

import { Skeleton } from '@tb/ui';

export const FullScreenLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950">
    <div className="flex w-full max-w-sm flex-col gap-6 px-6">
      <Skeleton className="h-12 rounded-2xl bg-slate-900" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
    </div>
  </div>
);

export default FullScreenLoader;
