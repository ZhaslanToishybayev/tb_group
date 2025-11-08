'use client';

import { motion } from 'framer-motion';

export type ClientLogo = {
  name: string;
  logoUrl: string;
};

const marqueeVariants = {
  animate: {
    x: ['0%', '-50%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 20,
        ease: 'linear',
      },
    },
  },
};

export function ClientLogosMarquee({ logos }: { logos: ClientLogo[] }) {
  if (logos.length === 0) {
    return null;
  }

  const duplicated = [...logos, ...logos];

  return (
    <section className="section bg-slate-900/30" id="clients">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center text-xs uppercase tracking-[0.35em] text-slate-400">Нам доверяют</p>
        <div className="relative mt-8 overflow-hidden">
          <motion.div className="flex w-max items-center gap-12" variants={marqueeVariants} animate="animate">
            {duplicated.map((logo, index) => (
              <div key={`${logo.name}-${index}`} className="flex h-16 w-32 items-center justify-center opacity-80 transition hover:opacity-100">
                {logo.logoUrl ? (
                  <img src={logo.logoUrl} alt={logo.name} className="max-h-12 w-auto object-contain" loading="lazy" />
                ) : (
                  <span className="text-sm font-semibold text-slate-200">{logo.name}</span>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ClientLogosMarquee;
