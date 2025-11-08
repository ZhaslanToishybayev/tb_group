'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

type HeroProps = {
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
};

export function HeroSection({ banner }: { banner?: HeroProps }) {
  return (
    <section className="section" id="hero">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:items-center">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm uppercase tracking-wide text-blue-400">TB Group</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            {banner?.title ?? 'Комплексные облачные решения для вашего бизнеса'}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            {banner?.subtitle ??
              'Внедряем Мой Склад и Битрикс24, интегрируем телефонию, обучаем команду и обеспечиваем поддержку.'}
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href={banner?.ctaLink ?? '/contact'}
              className="rounded bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400"
            >
              {banner?.ctaLabel ?? 'Получить презентацию'}
            </Link>
            <Link
              href="/services"
              className="rounded border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-blue-500 hover:text-white"
            >
              Все услуги
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-slate-900 to-blue-900/40 p-8 shadow-xl">
            <ul className="space-y-4 text-sm text-slate-200">
              <li>• Аудит и проектирование бизнес-процессов</li>
              <li>• Быстрое подключение и настройка интеграций</li>
              <li>• Обучение сотрудников и методические материалы</li>
              <li>• Техническая поддержка 24/7 и SLA</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
