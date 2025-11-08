'use client';

import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export type CaseStudyHeroProps = {
  title: string;
  subtitle?: string;
  category: string;
  date?: string;
  client?: string;
  duration?: string;
  backgroundImage?: string | null;
  backgroundVideo?: string | null;
  tags?: string[];
};

export function CaseStudyHero({
  title,
  subtitle,
  category,
  date,
  client,
  duration,
  backgroundImage,
  backgroundVideo,
  tags = [],
}: CaseStudyHeroProps) {
  return (
    <div className="relative min-h-[60vh] flex items-center overflow-hidden rounded-3xl">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {backgroundVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <img
            src={backgroundImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Category */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 backdrop-blur-sm px-4 py-2 mb-6"
          >
            <Tag size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-300">{category}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-slate-300 mb-8 leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Meta info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap gap-6 mb-8"
          >
            {client && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sm font-medium">Клиент:</span>
                <span className="text-sm">{client}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar size={16} />
                <span className="text-sm">{date}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-sm font-medium">Срок:</span>
                <span className="text-sm">{duration}</span>
              </div>
            )}
          </motion.div>

          {/* Tags */}
          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link
              href="#overview"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition-all group"
            >
              <span>Подробнее о проекте</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/50 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
