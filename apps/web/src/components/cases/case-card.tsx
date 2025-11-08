'use client';

import { motion } from 'framer-motion';
import type { Case } from '../../lib/api';
import { CaseMetrics } from './case-metrics';

const CATEGORY_LABELS: Record<string, string> = {
  MY_SKLAD: 'Мой Склад',
  BITRIX24: 'Bitrix24',
  TELEPHONY: 'Телефония',
};

type CaseCardProps = {
  caseItem: Case;
  onSelect: (caseItem: Case) => void;
};

export function CaseCard({ caseItem, onSelect }: CaseCardProps) {
  const categoryLabel = CATEGORY_LABELS[caseItem.category] ?? caseItem.category;
  const metrics = caseItem.metrics?.slice(0, 2) ?? [];

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(caseItem)}
      className="group flex h-full w-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/50 p-6 text-left shadow-lg shadow-slate-950/30 transition hover:border-blue-400/60 hover:bg-slate-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      whileHover={{ translateY: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-blue-300/80">{categoryLabel}</p>
        <h3 className="mt-4 text-xl font-semibold leading-snug text-white group-hover:text-blue-200">
          {caseItem.projectTitle}
        </h3>
        <p className="mt-2 text-sm text-slate-300 line-clamp-3">{caseItem.summary}</p>

        {metrics.length > 0 ? (
          <CaseMetrics metrics={metrics} dense className="mt-6" />
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-blue-300 transition group-hover:text-blue-200">
          Смотреть детали
        </span>
        <svg
          className="h-4 w-4 text-blue-300 transition group-hover:translate-x-1 group-hover:text-blue-200"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 3l4 5-4 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.button>
  );
}
