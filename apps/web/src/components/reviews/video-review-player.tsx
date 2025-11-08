'use client';

import { Play, Pause, Volume2 } from 'lucide-react';
import { useState } from 'react';

interface VideoReviewPlayerProps {
  videoUrl: string;
  videoProvider: 'YOUTUBE' | 'VIMEO';
  thumbnailUrl?: string;
  title?: string;
  className?: string;
}

export function VideoReviewPlayer({ 
  videoUrl, 
  videoProvider, 
  thumbnailUrl, 
  title = 'Видео отзыв',
  className = '' 
}: VideoReviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const getEmbedUrl = () => {
    switch (videoProvider) {
      case 'YOUTUBE':
        const youTubeId = extractYouTubeId(videoUrl);
        return youTubeId ? `https://www.youtube.com/embed/${youTubeId}?autoplay=0&rel=0` : '';
      case 'VIMEO':
        const vimeoId = extractVimeoId(videoUrl);
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}?h=0c0c0c0c` : '';
      default:
        return videoUrl;
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Thumbnail Overlay */}
      {!isLoaded && thumbnailUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <img 
            src={thumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-16 h-16 text-white/90" />
          </div>
        </div>
      )}

      {/* Video iframe */}
      <iframe
            src={getEmbedUrl()}
            title={title}
            className="w-full h-full min-h-[400px] md:min-h-[500px]"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-to-origin"
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(false)}
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
        <button
              onClick={handlePlay}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Воспроизвести"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
        
        <button
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              title="Громкость"
        >
          <Volume2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#?]+)/);
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:.*#|.*/videos\/)?([0-9]+)/);
  return match ? match[1] : null;
}