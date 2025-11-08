import type { ServiceContent } from '../../lib/api';

export function ServiceHighlights({ highlights }: { highlights?: ServiceContent['highlights']; }) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <section className="section bg-slate-900/40" id="service-highlights">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-center shadow-lg"
            >
              <div className="text-xs uppercase tracking-wide text-blue-300/80">{item.label}</div>
              <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceHighlights;
