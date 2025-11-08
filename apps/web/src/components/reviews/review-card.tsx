'use client';

import { Star, MapPin, Play } from 'lucide-react';
import { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
  className?: string;
}

// Вспомогательная функция для получения embed URL видео
function getVideoEmbedUrl(url: string, provider: 'YOUTUBE' | 'VIMEO'): string {
  if (provider === 'YOUTUBE') {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : url;
  } else if (provider === 'VIMEO') {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  }
  return url;
}

export function ReviewCard({ review, className = '' }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header with client info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-600 font-semibold text-lg">
              {review.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{review.authorName}</h3>
            <div className="text-sm text-slate-600">
              {review.authorTitle && <span>{review.authorTitle}</span>}
              {review.authorTitle && review.company && <span> в </span>}
              {review.company && <span className="font-medium">{review.company}</span>}
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-500">
          {new Date(review.createdAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Rating */}
      {review.rating && (
        <div className="flex items-center gap-1 mb-4">
          {renderStars(review.rating)}
          <span className="ml-2 text-sm font-medium text-slate-700">
            {review.rating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Video Review */}
      {review.reviewType === 'VIDEO' && review.videoUrl && review.videoProvider && (
        <div className="mb-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              src={getVideoEmbedUrl(review.videoUrl, review.videoProvider)}
              title={`Отзыв от ${review.authorName}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-to-origin"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Play className="w-12 h-12 text-white/80" />
            </div>
          </div>
        </div>
      )}

      {/* Review Content */}
      <div className="space-y-4">
        {review.quote && (
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Отзыв</h4>
            <p className="text-slate-700 leading-relaxed italic">"{review.quote}"</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              {review.reviewType === 'VIDEO' ? 'Видео отзыв' : 'Текстовый отзыв'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {review.isFeatured && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                Рекомендуемый
              </span>
            )}
            {review.isPublished && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                Опубликован
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get video embed URL
function getVideoEmbedUrl(url: string, provider: string): string {
  switch (provider) {
    case 'YOUTUBE':
      const videoId = extractYouTubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    case 'VIMEO':
      const videoId = extractVimeoId(url);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    default:
      return url;
  }
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#?]+)/);
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:.*#|.*/videos\/)?([0-9]+)/);
  return match ? match[1] : null;
}