'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

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
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  index: number;
}

export function CaseStudyCard({ caseStudy, index }: CaseStudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="relative h-[500px] w-full perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <motion.div
        className="relative h-full w-full cursor-pointer transform-gpu transition-transform duration-700"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="relative h-full w-full">
            <Image
              src={caseStudy.image}
              alt={caseStudy.title}
              fill
              className="object-cover"
              priority={index < 3}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                  {caseStudy.company}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">{caseStudy.title}</h3>
              <p className="text-sm text-slate-200 line-clamp-2 mb-4">
                {caseStudy.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {caseStudy.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hover Hint */}
              <div className="text-xs text-blue-300 flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <span>Нажмите для просмотра результатов</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl border border-white/10"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex h-full flex-col text-white">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{caseStudy.title}</h3>
              <p className="text-sm text-blue-300">{caseStudy.company}</p>
            </div>

            {/* Before/After Comparison */}
            <div className="flex-1 space-y-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-3">
                  До внедрения
                </h4>
                <div className="space-y-2">
                  <MetricRow label="Эффективность" value={caseStudy.beforeMetrics.efficiency} />
                  <MetricRow label="Время" value={caseStudy.beforeMetrics.time} />
                  <MetricRow label="Затраты" value={caseStudy.beforeMetrics.cost} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">
                  После внедрения
                </h4>
                <div className="space-y-2">
                  <MetricRow label="Эффективность" value={caseStudy.afterMetrics.efficiency} />
                  <MetricRow label="Время" value={caseStudy.afterMetrics.time} />
                  <MetricRow label="Затраты" value={caseStudy.afterMetrics.cost} />
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/cases/${caseStudy.slug}`}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
              onClick={(e) => e.stopPropagation()}
            >
              Подробнее о кейсе
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

export default CaseStudyCard;
