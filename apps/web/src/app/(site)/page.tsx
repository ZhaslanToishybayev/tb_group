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
import { BlogPreview } from '../../components/blog/BlogPreview';
import { NewsletterSubscription } from '../../components/ui/NewsletterSubscription';
import { StatsGrid } from '../../components/ui/StatsGrid';
import {
  getServices,
  getReviews,
  getSettings,
} from '../../lib/api';
import { TrendingUp, Users, Award, Clock } from 'lucide-react';

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

// Stats for the StatsGrid component
const stats = [
  { id: '1', value: 500, label: 'Довольных клиентов', suffix: '+', color: 'primary' as const },
  { id: '2', value: 1000, label: 'Завершенных проектов', suffix: '+', color: 'secondary' as const },
  { id: '3', value: 99, label: 'Удовлетворенность клиентов', suffix: '%', color: 'success' as const },
  { id: '4', value: 24, label: 'Часа поддержки в день', suffix: '/7', color: 'neon' as const },
];

// Mock blog posts for demo
const blogPosts = [
  {
    id: '1',
    title: 'Внедрение Мой Склад: Полное руководство',
    excerpt: 'Как правильно внедрить систему Мой Склад в ваш бизнес и получить максимальную эффективность.',
    coverImage: '',
    author: { name: 'Иван Петров', avatar: '' },
    publishedAt: '2024-11-08',
    readTime: 8,
    category: 'Мой Склад',
    slug: 'moy-sklad-guide',
  },
  {
    id: '2',
    title: 'Битрикс24 для малого бизнеса',
    excerpt: 'Пошаговая инструкция по настройке Битрикс24 для эффективной работы команды.',
    coverImage: '',
    author: { name: 'Мария Сидорова', avatar: '' },
    publishedAt: '2024-11-05',
    readTime: 12,
    category: 'Битрикс24',
    slug: 'bitrix24-small-business',
  },
  {
    id: '3',
    title: 'Корпоративная телефония: выбор и внедрение',
    excerpt: 'Современные решения для корпоративной связи и как выбрать подходящую систему.',
    coverImage: '',
    author: { name: 'Алексей Козлов', avatar: '' },
    publishedAt: '2024-11-02',
    readTime: 10,
    category: 'Телефония',
    slug: 'corporate-telephony',
  },
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

  const settingsArray = Array.isArray(settings) ? settings : [];
  const advantagesSetting = settingsArray.find((setting) => setting.key === 'HOMEPAGE_ADVANTAGES')?.value;
  const logosSetting = settingsArray.find((setting) => setting.key === 'HOMEPAGE_CLIENT_LOGOS')?.value;

  const advantages = parseSettingArray<Advantage>(advantagesSetting, defaultAdvantages);
  const logos = parseSettingArray<ClientLogo>(logosSetting, defaultClientLogos);

  return (
    <>
      <div id="main-content">
        <Hero />

        <ServicesSection services={services} />

        {/* Stats Grid Section */}
        <section className="py-20 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <StatsGrid stats={stats} />
          </div>
        </section>

        <AdvantagesSection advantages={advantages} />

        <ClientLogosMarquee logos={logos} />

        {/* Blog Preview Section */}
        <BlogPreview posts={blogPosts} className="py-20" />

        <TestimonialsSection />

        {/* Newsletter Subscription Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <NewsletterSubscription variant="default" />
          </div>
        </section>

        <CTASection />
      </div>
    </>
  );
}
