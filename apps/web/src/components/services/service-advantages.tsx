'use client';

import { motion } from 'framer-motion';

import type { ServiceContent } from '../../lib/api';

export function ServiceAdvantages({ advantages }: { advantages?: ServiceContent['advantages']; }) {
  if (!advantages || advantages.length === 0) {
    return null;
  }

  return (
    <section className="section" id="service-advantages">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Преимущества</h2>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">
          Мы выстраиваем сервис под процессы компании, а не наоборот.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {advantages.map((advantage, index) => (
            <motion.article
              key={`${advantage.title}-${index}`}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              {advantage.icon ? (
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                  <span className="text-lg">{advantage.icon}</span>
                </div>
              ) : null}
              <h3 className="text-lg font-semibold text-white">{advantage.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{advantage.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceAdvantages;
