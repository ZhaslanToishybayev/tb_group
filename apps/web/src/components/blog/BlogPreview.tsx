'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  category: string;
  slug: string;
}

interface BlogPreviewProps {
  posts: BlogPost[];
  className?: string;
}

export function BlogPreview({ posts, className }: BlogPreviewProps) {
  return (
    <section className={className}>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Наш блог</h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Полезные статьи о технологиях, бизнесе и цифровой трансформации
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Button variant="outline" rightIcon={ArrowRight}>
          Все статьи
        </Button>
      </div>
    </section>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl bg-slate-800/50 border border-white/10 hover:border-primary-500/50 transition-all duration-300">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
          <div
            className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 border border-primary-500/30">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author.name}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(post.publishedAt).toLocaleDateString('ru-RU')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime} мин
            </div>
          </div>

          {/* Read more */}
          <div className="flex items-center gap-2 text-primary-400 text-sm font-medium group-hover:gap-3 transition-all">
            Читать далее
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
