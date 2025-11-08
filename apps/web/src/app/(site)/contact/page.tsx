'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { MultiStepContactForm } from '../../../components/MultiStepContactForm';
import { ContactDetails } from '../../../components/ContactDetails';
import { ContactMap } from '../../../components/ContactMap';
import { SocialLinks } from '../../../components/SocialLinks';
import type { ContactInfo, SocialLink } from '../../../types/contact';

const defaultContacts: ContactInfo[] = [
  { label: 'Телефон', value: '+7 (700) 123-45-67', href: 'tel:+77001234567' },
  { label: 'Email', value: 'info@tbgroup.kz', href: 'mailto:info@tbgroup.kz' },
  { label: 'Адрес', value: 'г. Алматы, ул. Примерная 1, офис 123', href: null },
];

const defaultSocialLinks: SocialLink[] = [
  { label: 'WhatsApp', href: 'https://wa.me/77001234567', color: '#25D366' },
  { label: 'Telegram', href: 'https://t.me/tbgroup', color: '#0088CC' },
  { label: 'Instagram', href: 'https://instagram.com/tbgroup', color: '#E4405F' },
  { label: 'Bitrix24', href: 'https://tbgroup.bitrix24.kz', color: '#00B0D9' },
];

export default function ContactPage() {
  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: 'easeIn' } },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="section"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Свяжитесь с нами</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            Оставьте заявку — наш менеджер перезвонит в течение 15 минут и предложит оптимальное решение для вашего бизнеса.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
          {/* Contact Form */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Отправить заявку</h2>
              <MultiStepContactForm />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Details */}
            <ContactDetails contacts={defaultContacts} />

            {/* Map */}
            <ContactMap />

            {/* Social Links */}
            <SocialLinks links={defaultSocialLinks} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Почему выбирают TB Group?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">120+</div>
              <p className="text-sm text-slate-300">Успешных проектов</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">30</div>
              <p className="text-sm text-slate-300">Экспертов в команде</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">98%</div>
              <p className="text-sm text-slate-300">Довольных клиентов</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-slate-300 mb-4">
            Готовы начать数字化转型 вашего бизнеса?
          </p>
          <Link
            href="/services"
            className="inline-flex items-center rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
          >
            Наши услуги
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function parseContactArray(value: unknown, fallback: ContactInfo[]): ContactInfo[] {
  if (!value) {
    return fallback;
  }
  if (Array.isArray(value)) {
    return value as ContactInfo[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as ContactInfo[];
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function parseSocialLinksArray(value: unknown, fallback: SocialLink[]): SocialLink[] {
  if (!value) {
    return fallback;
  }
  if (Array.isArray(value)) {
    return value as SocialLink[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as SocialLink[];
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}
