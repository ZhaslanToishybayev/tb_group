'use client';

import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import type { Case } from '../../lib/api';
import { CaseMetrics } from './case-metrics';

type CaseDetailOverlayProps = {
  caseItem: Case;
  onClose: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  MY_SKLAD: 'Мой Склад',
  BITRIX24: 'Bitrix24',
  TELEPHONY: 'Телефония',
};

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function CaseDetailOverlay({ caseItem, onClose }: CaseDetailOverlayProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialog) {
        return;
      }

      const focusable = dialog.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || active === dialog) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === backdropRef.current) {
      onClose();
    }
  };

  const categoryLabel = CATEGORY_LABELS[caseItem.category] ?? caseItem.category;

  return (
    <motion.div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={handleBackdropMouseDown}
    >
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Кейс ${caseItem.projectTitle}`}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-left shadow-2xl shadow-slate-950/60"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 transition hover:border-blue-400/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <span className="sr-only">Закрыть детали кейса</span>
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 4l8 8m-8 0l8-8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="space-y-6 pr-2 text-slate-200">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">{categoryLabel}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{caseItem.projectTitle}</h2>
            <p className="mt-2 text-sm text-slate-300">{caseItem.summary}</p>
          </div>

          {caseItem.heroImageUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src={caseItem.heroImageUrl}
                alt={caseItem.projectTitle}
                className="h-64 w-full object-cover"
              />
            </div>
          ) : null}

          <CaseMetrics metrics={caseItem.metrics} />

          <DetailSection title="Задача" body={caseItem.challenge} />
          <DetailSection title="Решение" body={caseItem.solution} />
          <DetailSection title="Результат" body={caseItem.results} />

          {caseItem.media.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300/80">
                Материалы
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {caseItem.media.map((media) =>
                  media.type === 'VIDEO' ? (
                    <video
                      key={media.id}
                      controls
                      className="h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-black object-cover"
                    >
                      <source src={media.url} />
                    </video>
                  ) : (
                    <img
                      key={media.id}
                      src={media.url}
                      alt={media.altText ?? ''}
                      className="h-48 w-full overflow-hidden rounded-2xl border border-white/10 object-cover"
                    />
                  ),
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>Клиент:&nbsp;{caseItem.clientName}</span>
            {caseItem.industry ? <span>|&nbsp;Отрасль:&nbsp;{caseItem.industry}</span> : null}
            <span>|&nbsp;Обновлено:&nbsp;{new Date(caseItem.updatedAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

type DetailSectionProps = {
  title: string;
  body?: string | null;
};

function DetailSection({ title, body }: DetailSectionProps) {
  if (!body) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300/80">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200">{body}</p>
    </div>
  );
}
