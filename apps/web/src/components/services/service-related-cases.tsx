import Link from 'next/link';

import type { CaseSummary } from '../../lib/api';

export function ServiceRelatedCases({ cases }: { cases: CaseSummary[] }) {
  if (!cases || cases.length === 0) {
    return null;
  }

  return (
    <section className="section" id="service-cases">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Кейсы по этому направлению</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Делимся результатами проектов: рост продаж, снижение времени на операции и прозрачные отчёты.
            </p>
          </div>
          <Link href="/cases" className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">
            Смотреть все кейсы →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((item) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg">
              <p className="text-xs uppercase tracking-wide text-blue-300/80">{item.category}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.projectTitle}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
              <Link
                href={`/cases/${item.slug}`}
                className="mt-6 inline-flex items-center text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Подробнее о кейсе →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceRelatedCases;
