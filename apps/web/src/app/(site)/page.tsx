import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AdvantagesSection,
  ClientLogosMarquee,
  CTASection,
  type Advantage,
  type ClientLogo,
} from '../../components/home';
import { Hero } from '../../components/sections/Hero';
import {
  ServicesSection,
  TestimonialsSection,
} from '../../components/sections';
import {
  getServices,
  getReviews,
  getSettings,
} from '../../lib/api';

export const metadata: Metadata = {
  title: 'TB Group — Облачные решения для бизнеса',
  description: 'Внедрение Мой Склад, Битрикс24 и корпоративной телефонии под ключ.',
};

const defaultAdvantages: Advantage[] = [
  {
    title: 'Комплексное внедрение «под ключ»',
    description: 'Проектируем архитектуру, настраиваем интеграции и обучаем сотрудников, чтобы команда сразу работала в новой системе.',
  },
  {
    title: 'Гарантируем быстрый эффект',
    description: 'Показываем измеримый рост эффективности уже в первые недели — фиксируем KPI и сопровождаем по SLA.',
  },
  {
    title: 'Прозрачная коммуникация',
    description: 'Закрепляем проектного менеджера, ведём единый контур в Bitrix24 и предоставляем понятный план миров.',
  },
];

const defaultClientLogos: ClientLogo[] = [
  { name: 'SaaS Group', logoUrl: '' },
  { name: 'Logist Pro', logoUrl: '' },
  { name: 'Retail Hub', logoUrl: '' },
  { name: 'FinTech One', logoUrl: '' },
];

const parseSettingArray = <T,>(value: unknown, fallback: T[]): T[] => {
  if (!value) {
    return fallback;
  }
  if (Array.isArray(value)) {
    return value as T[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as T[];
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export default async function HomePage() {
  const [services, reviews, settings] = await Promise.all([
    getServices().catch(() => []),
    getReviews({ isFeatured: true }).catch(() => []),
    getSettings().catch(() => []),
  ]);

  const advantagesSetting = settings.find((setting) => setting.key === 'HOMEPAGE_ADVANTAGES')?.value;
  const logosSetting = settings.find((setting) => setting.key === 'HOMEPAGE_CLIENT_LOGOS')?.value;

  const advantages = parseSettingArray<Advantage>(advantagesSetting, defaultAdvantages);
  const logos = parseSettingArray<ClientLogo>(logosSetting, defaultClientLogos);

  return (
    <>
      <div id="main-content">
        <Hero />

        <ServicesSection services={services} />

        <AdvantagesSection advantages={advantages} />

        <ClientLogosMarquee logos={logos} />

        <TestimonialsSection />

        <CTASection />
      </div>
    </>
  );
}
