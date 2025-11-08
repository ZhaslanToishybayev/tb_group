'use client';

import { motion, useMotionValue, useTransform, MotionValue } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import type { Service } from '../../lib/api';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const getServiceCategory = (slug: string): string => {
    const categories: Record<string, string> = {
      'moy-sklad': 'ERP',
      'bitrix24': 'CRM',
      'telephony': 'VoIP',
      'integration': 'Интеграции',
    };
    return categories[slug] || 'Сервис';
  };

  const getServiceIcon = (slug: string): string => {
    const icons: Record<string, string> = {
      'moy-sklad': '📦',
      'bitrix24': '💼',
      'telephony': '📞',
      'integration': '🔗',
    };
    return icons[slug] || '⚡';
  };

  return (
    <motion.div
      className="group relative h-[400px] w-full perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
    >
      <motion.div
        className="relative h-full w-full transform-gpu transition-transform duration-300 ease-out"
        whileHover={{ scale: 1.02 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Content */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 shadow-2xl backdrop-blur-sm">
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300 border border-blue-500/30">
              {getServiceCategory(service.slug)}
            </span>
          </div>

          {/* Icon */}
          <div className="text-4xl mb-4 mt-2">
            {getServiceIcon(service.slug)}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-300 mb-6 line-clamp-3">
            {service.summary}
          </p>

          {/* Features List */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-green-400">✓</span>
              <span>Внедрение и настройка</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-green-400">✓</span>
              <span>Обучение команды</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-green-400">✓</span>
              <span>Техническая поддержка</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href={`/services/${service.slug}`}
            className="absolute bottom-6 left-6 right-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/25 group-hover:scale-105"
          >
            Подробнее о сервисе
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
        </div>

        {/* 3D Background Element */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 transform translateZ-[-50px]"
          style={{ transform: 'translateZ(-50px)' }}
        />
      </motion.div>
    </motion.div>
  );
}

export default ServiceCard;
