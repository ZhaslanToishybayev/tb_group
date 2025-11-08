'use client';

import { useMemo } from 'react';

import { ContactForm } from '../../components/ContactForm';
import type { ServiceContent, ServiceDetail } from '../../lib/api';

const SERVICE_CATEGORY_BY_SLUG: Record<string, string> = {
  'my-sklad': 'MY_SKLAD',
  'bitrix24': 'BITRIX24',
  'telephony': 'TELEPHONY',
};

export function ServiceInquirySection({ service, content }: { service: ServiceDetail; content: ServiceContent; }) {
  const defaultServiceInterest = useMemo(() => SERVICE_CATEGORY_BY_SLUG[service.slug] ?? '', [service.slug]);
  const cta = content.cta ?? {
    title: 'Запланируйте консультацию',
    subtitle: 'Расскажем о этапе запуска, подготовим расчёт и предложим пилотный сценарий.',
    ctaLabel: 'Оставить заявку',
    ctaLink: '/contact',
  };

  return (
    <section className="section bg-slate-900/60" id="service-inquiry">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-300/80">Свяжитесь с TB Group</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{cta.title}</h2>
          {cta.subtitle ? <p className="mt-3 text-sm text-slate-300 sm:text-base">{cta.subtitle}</p> : null}
          <p className="mt-6 text-xs uppercase tracking-wide text-blue-300/80">Какие вопросы обсуждаем</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>• Диагностика текущих процессов и систем</li>
            <li>• План внедрения и roadmap на 90 дней</li>
            <li>• Стоимость настройки и сопровождения</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-xl">
          <ContactForm defaultServiceInterest={defaultServiceInterest} hideServiceSelect />
        </div>
      </div>
    </section>
  );
}

export default ServiceInquirySection;
