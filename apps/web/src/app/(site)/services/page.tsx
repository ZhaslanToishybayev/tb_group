import Link from 'next/link';

import { getServices, parseServiceContent } from '../../../lib/api';

export const metadata = {
  title: 'Услуги — TB Group',
  description: 'Внедряем облачные решения: Мой Склад, Bitrix24 и корпоративную телефонию. Настраиваем процессы, автоматизируем и поддерживаем 24/7.',
};

export default async function ServicesPage() {
  const servicesData = await getServices().catch(() => []);
  const services = Array.isArray(servicesData) ? servicesData : [];

  return (
    <div className="bg-slate-950">
      <section className="section">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Облачные сервисы TB Group</h1>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Настраиваем цифровую экосистему бизнеса: от учёта и складских процессов до CRM и телефонии.
          </p>
        </div>
      </section>
      <section className="section pt-0">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const content = parseServiceContent(service.description);
            const highlights = content?.highlights?.slice(0, 3) ?? [];
            const bullets = content?.hero?.bullets?.slice(0, 2) ?? [];
            const list = highlights.length > 0 ? highlights.map((item) => item.value) : bullets;

            return (
              <article key={service.id} className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-blue-300/80">Сервис</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{service.title}</h2>
                  <p className="mt-3 text-sm text-slate-300">{service.summary}</p>
                  {list.length > 0 ? (
                    <ul className="mt-6 space-y-2 text-sm text-slate-200">
                      {list.map((item, index) => (
                        <li key={`${service.slug}-point-${index}`} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="mt-8 flex items-center justify-between text-sm">
                  <Link href={`/services/${service.slug}`} className="font-semibold text-blue-400 transition hover:text-blue-300">
                    Подробнее →
                  </Link>
                  <Link href={`/contact?service=${service.slug}`} className="text-slate-300 hover:text-white">
                    Заказать консультацию
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
