'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import type { Banner } from '../../lib/api';

const defaultHero = {
  title: 'Облачные решения для ускорения бизнеса',
  subtitle: 'Внедряем Мой Склад, Битрикс24 и корпоративную телефонию. Настраиваем процессы, обучаем команду, поддерживаем 24/7.',
  ctaLabel: 'Получить аудит',
  ctaLink: '/contact',
  secondaryCtaLabel: 'Узнать кейсы',
  secondaryCtaLink: '/cases',
};

export function HeroPromo({ banner }: { banner?: Banner }) {
  const title = banner?.title ?? defaultHero.title;
  const subtitle = banner?.subtitle ?? defaultHero.subtitle;
  const ctaLabel = banner?.ctaLabel ?? defaultHero.ctaLabel;
  const ctaLink = banner?.ctaLink ?? defaultHero.ctaLink;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <motion.div
          className="absolute -left-32 top-24 h-64 w-64 rounded-full bg-blue-500/40 blur-3xl"
          animate={{ y: [0, -20, 0], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl"
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-24 lg:flex-row lg:items-center lg:gap-16">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">TB Group</p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">{subtitle}</p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href={ctaLink ?? '/contact'}
              className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
            >
              {ctaLabel}
            </Link>
            <Link
              href={defaultHero.secondaryCtaLink}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400/60 hover:text-white"
            >
              {defaultHero.secondaryCtaLabel}
            </Link>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-6 text-left text-sm text-slate-300 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase text-slate-400">Запущенных проектов</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">120+</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Экспертов в команде</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">30</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Время запуска</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">2 недели</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Удовлетворённость</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">98%</dd>
            </div>
          </dl>
        </motion.div>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-200 shadow-2xl">
            <p className="text-xs uppercase tracking-wide text-blue-300">Ценности TB Group</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                Интегрируем облачные сервисы в существующие процессы без остановки бизнеса.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                Настраиваем аналитические цепочки: CRM → телефония → склад → отчёты в реальном времени.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                Обучаем команды и сопровождаем изменения по SLA.
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroPromo;
