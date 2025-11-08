'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { CaseStudyCard } from './CaseStudyCard';

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  summary: string;
  image: string;
  beforeMetrics: {
    efficiency: string;
    time: string;
    cost: string;
  };
  afterMetrics: {
    efficiency: string;
    time: string;
    cost: string;
  };
  tags: string[];
  slug: string;
  gallery?: string[];
}

interface CaseStudiesSectionProps {
  caseStudies: CaseStudy[];
}

// Sample data - replace with real API data
const mockCaseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Внедрение Мой Склад в ритейле',
    company: 'Торговая сеть "Пятёрочка+"',
    summary: 'Оптимизация складских процессов и автоматизация учёта',
    image: '/api/placeholder/800/600',
    beforeMetrics: {
      efficiency: '45%',
      time: '6 часов/день',
      cost: '250,000 ₽/мес',
    },
    afterMetrics: {
      efficiency: '92%',
      time: '2 часа/день',
      cost: '180,000 ₽/мес',
    },
    tags: ['Мой Склад', 'ERP', 'Автоматизация'],
    slug: 'moy-sklad-retail-case',
  },
  {
    id: '2',
    title: 'Настройка Битрикс24 для B2B',
    company: 'ТехноСфера ООО',
    summary: 'Цифровизация продаж и автоматизация CRM-процессов',
    image: '/api/placeholder/800/600',
    beforeMetrics: {
      efficiency: '38%',
      time: '8 часов/день',
      cost: '320,000 ₽/мес',
    },
    afterMetrics: {
      efficiency: '89%',
      time: '3 часа/день',
      cost: '220,000 ₽/мес',
    },
    tags: ['Битрикс24', 'CRM', 'B2B'],
    slug: 'bitrix24-b2b-case',
  },
  {
    id: '3',
    title: 'Корпоративная телефония',
    company: 'СтройМастер',
    summary: 'Внедрение IP-телефонии и интеграция с CRM',
    image: '/api/placeholder/800/600',
    beforeMetrics: {
      efficiency: '42%',
      time: '7 часов/день',
      cost: '280,000 ₽/мес',
    },
    afterMetrics: {
      efficiency: '85%',
      time: '3 часа/день',
      cost: '190,000 ₽/мес',
    },
    tags: ['Телефония', 'IP', 'Интеграция'],
    slug: 'telephony-integration-case',
  },
];

export function CaseStudiesSection({ caseStudies = mockCaseStudies }: CaseStudiesSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950" id="case-studies">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Кейсы
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Результаты наших клиентов
          </motion.h2>
          <motion.p
            className="text-lg text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Реальные истории успеха и измеримые результаты внедрения наших решений
          </motion.p>
        </motion.div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <motion.a
            href="/cases"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Все кейсы
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>
        </motion.div>
      </div>

      {/* Lightbox Gallery Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-60 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <motion.div
              className="relative max-w-5xl max-h-[90vh] w-full"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Case study image"
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg shadow-2xl"
                priority
              />
            </motion.div>

            {/* Navigation Buttons */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement prev image logic
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement next image logic
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default CaseStudiesSection;
