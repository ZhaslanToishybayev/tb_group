'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import type { Review } from '../../lib/api';

export function TestimonialsTeaser({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return null;
  }

  const highlighted = reviews.slice(0, 3);

  return (
    <section className="section" id="reviews">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Отзывы клиентов</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Мы собираем обратную связь после каждого проекта и строим дорожную карту улучшений.
            </p>
          </div>
          <Link href="/reviews" className="text-sm font-semibold text-blue-400 transition hover:text-blue-300">
            Все отзывы →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {highlighted.map((review, index) => (
            <motion.article
              key={review.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div>
                <p className="text-sm text-slate-200">{review.quote ?? 'Без текста отзыва'}</p>
              </div>
              <div className="mt-6">
                <div className="text-sm font-semibold text-white">{review.authorName}</div>
                {review.company ? <div className="text-xs text-slate-400">{review.company}</div> : null}
                {review.reviewType === 'VIDEO' && review.videoUrl ? (
                  <Link
                    href={review.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    Смотреть видео →
                  </Link>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsTeaser;
