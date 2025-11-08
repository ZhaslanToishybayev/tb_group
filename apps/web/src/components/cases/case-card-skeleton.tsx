'use client';

export function CaseCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-slate-900/40 p-6">
      <div className="h-4 w-20 rounded-full bg-slate-700/60" />
      <div className="mt-4 h-6 w-3/4 rounded-full bg-slate-700/60" />
      <div className="mt-2 h-6 w-2/3 rounded-full bg-slate-700/50" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-full bg-slate-700/40" />
        <div className="h-3 w-5/6 rounded-full bg-slate-700/40" />
        <div className="h-3 w-2/3 rounded-full bg-slate-700/40" />
      </div>
      <div className="mt-6 h-10 w-28 rounded-full bg-slate-700/50" />
    </div>
  );
}
