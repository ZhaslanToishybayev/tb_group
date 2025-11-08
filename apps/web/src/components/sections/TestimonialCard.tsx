'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  avatar?: string;
  quote: string;
  rating: number;
  videoUrl?: string;
  isVideo?: boolean;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  total: number;
}

export function TestimonialCard({ testimonial, index, total }: TestimonialCardProps) {
  // Calculate rotation for 3D effect
  const angle = (index / total) * 360;
  const radius = 400;

  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const z = Math.sin((angle * Math.PI) / 180) * radius;
  const rotateY = angle + 90;

  // Determine if card is in front (visible)
  const isFront = angle < 90 || angle > 270;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        x: x / 2,
        y: 0,
        z: z,
        rotateY,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
      }}
      animate={{
        rotateY,
        x: x / 2,
        z: z,
      }}
      transition={{
        type: 'spring',
        stiffness: 50,
        damping: 20,
        mass: 1,
      }}
    >
      <motion.div
        className={`
          w-80 h-[420px] rounded-2xl border shadow-2xl backdrop-blur-sm
          ${isFront
            ? 'border-blue-500/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-blue-500/20'
            : 'border-white/5 bg-slate-900/80 opacity-70'
          }
        `}
        whileHover={{ scale: isFront ? 1.05 : 1.02 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {testimonial.isVideo && testimonial.videoUrl ? (
          /* Video Testimonial */
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <video
              className="h-full w-full object-cover"
              controls
              poster={testimonial.avatar}
            >
              <source src={testimonial.videoUrl} type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm font-semibold">{testimonial.name}</p>
              <p className="text-xs text-slate-300">
                {testimonial.position} • {testimonial.company}
              </p>
            </div>
          </div>
        ) : (
          /* Text Testimonial */
          <div className="flex h-full flex-col p-6 text-white">
            {/* Rating */}
            <div className="mb-4 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-slate-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mb-6 flex-1 text-slate-200">
              "{testimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4 border-t border-white/10 pt-4">
              {testimonial.avatar ? (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full border-2 border-blue-500/50"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold">
                  {testimonial.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-slate-400">
                  {testimonial.position} • {testimonial.company}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Glow Effect */}
        {isFront && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 pointer-events-none" />
        )}
      </motion.div>
    </motion.div>
  );
}

export default TestimonialCard;
