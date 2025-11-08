'use client';

import React, { useState, useEffect } from 'react';
import { getReviews } from '../../../lib/api';
import { ReviewCard } from '@/components/reviews/review-card';
import { VideoReviewPlayer } from '@/components/reviews/video-review-player';

export const metadata = {
  title: 'Отзывы — TB Group',
};

type ReviewFilter = 'ALL' | 'TEXT' | 'VIDEO';

import type { Review } from '@/types/review';

const REVIEWS_PER_PAGE = 6;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Загрузка отзывов
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getReviews({ isPublished: true }); // Получаем только опубликованные
        setReviews(data);
      } catch (error) {
        console.error('Failed to load reviews:', error);
        setError('Не удалось загрузить отзывы. Попробуйте позже.');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Фильтрация отзывов
  const filteredReviews = reviews.filter(review => {
    switch (filter) {
      case 'ALL':
        return true;
      case 'TEXT':
        return review.reviewType === 'TEXT';
      case 'VIDEO':
        return review.reviewType === 'VIDEO';
      default:
        return true;
    }
  });

  // Пагинация
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);

  // Сброс страницы при изменении фильтра
  const handleFilterChange = (newFilter: ReviewFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // Разделение на видео и текстовые для отображения
  const videoReviews = paginatedReviews.filter(review => review.reviewType === 'VIDEO');
  const textReviews = paginatedReviews.filter(review => review.reviewType === 'TEXT');

  return (
    <div className="section">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-4xl font-semibold text-white">Отзывы</h1>
        
        {/* Фильтры */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Все отзывы
          </button>
          <button
            onClick={() => handleFilterChange('TEXT')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'TEXT'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Текстовые
          </button>
          <button
            onClick={() => handleFilterChange('VIDEO')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'VIDEO'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Видео отзывы
          </button>
        </div>

        {/* Статистика */}
        <div className="mb-8 text-center text-slate-300">
          Всего: {filteredReviews.length} отзывов
          {totalPages > 1 && ` (страница ${currentPage} из ${totalPages})`}
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Загрузка */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Видео отзывы */}
            {videoReviews.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">Видео отзывы</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {videoReviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                      <VideoReviewPlayer
                            videoUrl={review.videoUrl!}
                            videoProvider={review.videoProvider!}
                            thumbnailUrl={review.videoThumbnailUrl}
                            title={`Отзыв от ${review.authorName}`}
                      />
                      <ReviewCard review={review} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Текстовые отзывы */}
            {textReviews.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-white mb-6">Текстовые отзывы</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {textReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}

            {/* Пустое состояние */}
            {filteredReviews.length === 0 && !loading && !error && (
              <div className="text-center py-12">
                <p className="text-slate-400">Отзывы пока не добавлены</p>
              </div>
            )}
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              ← Предыдущая
            </button>

            {/* Номера страниц */}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
            >
              Следующая →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
