'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import type { ServiceContent } from '../../lib/api';

export function ServiceGallery({ gallery }: { gallery?: ServiceContent['gallery']; }) {
  const items = gallery?.items ?? [];
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="section" id="service-gallery">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">Примеры интерфейсов и процессов</h2>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Демонстрируем ключевые экраны, схемы интеграций и отчёты. Больше примеров доступно по запросу.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <motion.figure
              key={`${item.url}-${index}`}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-lg"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {item.type === 'video' ? (
                <VideoEmbed url={item.url} />
              ) : (
                <div className="relative h-56 w-full">
                  <Image
                    src={item.url}
                    alt={item.title ?? 'Галерея'}
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <figcaption className="p-5">
                <div className="text-sm font-semibold text-white">{item.title ?? 'Визуальный пример'}</div>
                {item.description ? <p className="mt-2 text-xs text-slate-300">{item.description}</p> : null}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const VideoEmbed = ({ url }: { url: string }) => {
  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  if (isYouTube) {
    const embedUrl = convertYouTubeUrl(url);
    return (
      <div className="relative h-56 w-full">
        <iframe
          src={embedUrl}
          title="Видео отзыв"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video className="h-56 w-full object-cover" controls preload="metadata">
      <source src={url} />
      Ваш браузер не поддерживает воспроизведение видео.
    </video>
  );
};

const convertYouTubeUrl = (url: string) => {
  try {
    const { searchParams, hostname, pathname } = new URL(url);
    if (hostname.includes('youtu.be')) {
      const videoId = pathname.replace('/', '');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return `https://www.youtube.com/embed/${searchParams.get('v') ?? ''}`;
  } catch {
    return url;
  }
};

export default ServiceGallery;
