'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import type { ServiceContent, ServiceDetail } from '../../lib/api';

type HeroCta = {
  label?: string;
  href?: string;
};

const heroVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function ServiceHero({ service, content }: { service: ServiceDetail; content: ServiceContent; }) {
  const hero = content.hero ?? {};
  const title = hero.title ?? service.title;
  const subtitle = hero.subtitle ?? service.summary;
  const bullets = hero.bullets ?? [];
  const stats = hero.stats ?? [];
  const { label: ctaLabel, href: ctaHref } = resolveCta(hero.cta, content.cta);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <motion.div
          className="absolute -left-32 top-24 h-64 w-64 rounded-full bg-blue-500/40 blur-3xl"
          animate={{ y: [0, -20, 0], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl"
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-24 lg:flex-row lg:items-center lg:gap-16">
        <motion.div
          className="flex-1"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
        >
          {hero.eyebrow ? (
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">{hero.eyebrow}</p>
          ) : (
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">TB Group · Сервис</p>
          )}
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">{subtitle}</p>
          {bullets.length > 0 ? (
            <ul className="mt-8 space-y-3 text-sm text-slate-200">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
      {ctaHref ? (
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
        >
          {ctaLabel ?? 'Связаться'}
        </Link>
      ) : null}
            <Link
              href="/cases"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400/60 hover:text-white"
            >
              Смотреть кейсы
            </Link>
          </div>
          {stats.length > 0 ? (
            <dl className="mt-12 grid grid-cols-2 gap-6 text-left text-sm text-slate-300 sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`}>
                  <dt className="text-xs uppercase text-slate-400">{stat.label}</dt>
                  <dd className="mt-2 text-2xl font-semibold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </motion.div>
        {hero.image?.url ? (
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl sm:h-80 lg:h-96">
              <Image
                src={hero.image.url}
                alt={hero.image.alt ?? service.title}
                fill
                className="object-cover"
                priority={false}
              />
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

const resolveCta = (heroCta?: HeroCta, contentCta?: ServiceContent['cta']) => {
  const source = heroCta ?? contentCta ?? { label: 'Получить консультацию', href: '/contact' };

  if (typeof source === 'object' && source !== null) {
    if ('label' in source || 'href' in source) {
      return {
        label: (source as { label?: string }).label ?? 'Получить консультацию',
        href: (source as { href?: string }).href ?? '/contact',
      };
    }

    return {
      label: (source as { ctaLabel?: string }).ctaLabel ?? 'Получить консультацию',
      href: (source as { ctaLink?: string }).ctaLink ?? '/contact',
    };
  }

  return { label: 'Получить консультацию', href: '/contact' };
};

export default ServiceHero;
