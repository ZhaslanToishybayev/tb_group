import Link from 'next/link';
import React from 'react';

export function CTASection() {
  return (
    <section className="section bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-950" id="contact">
      <div className="mx-auto max-w-5xl rounded-3xl border border-blue-500/20 bg-slate-900/60 p-10 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Свяжитесь с нами</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Готовы запустить новый проект?
        </h2>
        <p className="mt-4 text-sm text-slate-200 sm:text-base">
          Оставьте заявку — подготовим план внедрения, покажем быстрые результаты и поможем команде перейти на облачные инструменты.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
          >
            Оставить заявку
          </Link>
          <Link
            href="tel:+74950000000"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-blue-400/60 hover:text-white"
          >
            +7 (495) 000-00-00
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
