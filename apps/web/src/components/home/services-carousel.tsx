'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import type { Service } from '../../lib/api';

export function ServicesCarousel({ services }: { services: Service[] }) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section className="section" id="services">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Решения под ваш бизнес</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Проектируем, настраиваем и сопровождаем облачные продукты, чтобы команды быстрее росли.
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
          >
            Все услуги →
          </Link>
        </div>
        <motion.div
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ initial: {}, animate: {} }}
        >
          {services.map((service, index) => (
            <motion.article
              key={service.id}
              className="min-w-[280px] flex-1 snap-start rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-500/60 lg:min-w-[360px]"
              variants={{
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <p className="text-xs uppercase tracking-wide text-blue-300/80">Сервис</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-4 line-clamp-4 text-sm text-slate-300">{service.summary}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 px-3 py-1">Внедрение</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Обучение</span>
                <span className="rounded-full border border-white/10 px-3 py-1">Поддержка</span>
              </div>
              <Link
                href={`/services/${service.slug}`}
                className="mt-8 inline-flex items-center text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Подробнее о сервисе →
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesCarousel;
