'use client';

import { motion } from 'framer-motion';

import type { ServiceContent } from '../../lib/api';

export function ServiceProcessTimeline({ process }: { process?: ServiceContent['process']; }) {
  const steps = process?.steps ?? [];
  if (steps.length === 0) {
    return null;
  }

  return (
    <section className="section bg-slate-950" id="service-process">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">{process.title ?? 'Как проходит внедрение'}</h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Прозрачно фиксируем этапы и результаты — каждый шаг сопровождаем материалами и инструкциями.
          </p>
        </div>
        <div className="relative border-l border-white/10 pl-6">
          {steps.map((step, index) => (
            <motion.div
              key={`${step.title}-${index}`}
              className="relative mb-10 pl-6 last:mb-0"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <span className="absolute -left-[0.78rem] top-1 flex h-3 w-3 items-center justify-center rounded-full border border-blue-400 bg-slate-900" />
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg">
                <div className="text-xs uppercase tracking-wide text-blue-300/80">Этап {index + 1}</div>
                <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                {step.description ? <p className="mt-2 text-sm text-slate-300">{step.description}</p> : null}
                {step.duration ? <p className="mt-3 text-xs text-slate-400">Длительность: {step.duration}</p> : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceProcessTimeline;
