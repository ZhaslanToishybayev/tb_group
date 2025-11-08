'use client';

import type { CaseMetric } from '../../lib/api';

type CaseMetricsProps = {
  metrics?: CaseMetric[] | null;
  dense?: boolean;
  className?: string;
};

const metricClassName =
  'rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-left shadow-sm shadow-slate-950/40';

export function CaseMetrics({ metrics, dense = false, className = '' }: CaseMetricsProps) {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  const displayMetrics = dense ? metrics.slice(0, 2) : metrics;

  return (
    <div
      className={`grid gap-3 ${dense ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} ${className}`}
    >
      {displayMetrics.map((metric) => (
        <div key={`${metric.label}-${metric.value}`} className={metricClassName}>
          <p className="text-xs uppercase tracking-wide text-blue-300/80">{metric.label}</p>
          <p className="mt-1 text-xl font-semibold text-white">
            {metric.value}
            {metric.unit ? <span className="ml-1 text-sm text-slate-300">{metric.unit}</span> : null}
          </p>
          {metric.description ? (
            <p className="mt-1 text-xs text-slate-400">{metric.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
