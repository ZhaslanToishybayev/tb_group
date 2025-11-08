'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

import type { Service } from '../../lib/api';
import { ServiceCard } from './ServiceCard';
import { ServiceFilters } from './ServiceFilters';

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Define filter options
  const filters = [
    { id: 'all', label: 'Все услуги' },
    { id: 'ERP', label: 'ERP' },
    { id: 'CRM', label: 'CRM' },
    { id: 'VoIP', label: 'Телефония' },
    { id: 'integration', label: 'Интеграции' },
  ];

  // Map services to categories
  const getServiceCategory = (slug: string): string => {
    const categories: Record<string, string> = {
      'moy-sklad': 'ERP',
      'bitrix24': 'CRM',
      'telephony': 'VoIP',
      'integration': 'integration',
    };
    return categories[slug] || 'other';
  };

  // Filter services
  const filteredServices = activeFilter === 'all'
    ? services
    : services.filter(service => getServiceCategory(service.slug) === activeFilter);

  // Get service count per category
  const getFilterCount = (filterId: string): number => {
    if (filterId === 'all') return services.length;
    return services.filter(service => getServiceCategory(service.slug) === filterId).length;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900" id="services">
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
            Наши решения
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Решения под ваш бизнес
          </motion.h2>
          <motion.p
            className="text-lg text-slate-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Проектируем, настраиваем и сопровождаем облачные продукты,
            чтобы команды быстрее росли и эффективнее работали
          </motion.p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <ServiceFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            filters={filters.map(f => ({ ...f, count: getFilterCount(f.id) }))}
          />
        </motion.div>

        {/* Services Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AnimatePresence mode="wait">
              {filteredServices.map((service, index) => (
                <motion.div key={`${activeFilter}-${service.id}`} variants={itemVariants}>
                  <ServiceCard service={service} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg">
              В данной категории пока нет услуг
            </p>
          </motion.div>
        )}

        {/* View All Link */}
        {filteredServices.length > 0 && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            <motion.a
              href="/services"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Все услуги
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ServicesSection;
