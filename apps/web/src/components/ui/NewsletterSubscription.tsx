'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface NewsletterSubscriptionProps {
  className?: string;
  variant?: 'default' | 'inline';
}

export function NewsletterSubscription({ className, variant = 'default' }: NewsletterSubscriptionProps) {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setMessage('Спасибо за подписку! Мы отправим вам лучшие новости.');
      setEmail('');
    }, 1500);
  };

  if (variant === 'inline') {
    return (
      <div className={className}>
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-success-500"
          >
            <CheckCircle className="h-5 w-5" />
            <span>{message}</span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="Ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" loading={status === 'loading'}>
              Подписаться
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-white/10 p-8 ${className}`}>
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary-500/20">
            <Mail className="h-6 w-6 text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold">Подпишитесь на новости</h3>
        </div>

        <p className="text-slate-300 mb-6">
          Получайте последние новости о технологиях, кейсы и эксклюзивные предложения
        </p>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-success-500/10 border border-success-500/20"
          >
            <CheckCircle className="h-6 w-6 text-success-500 flex-shrink-0" />
            <p className="text-success-400">{message}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                loading={status === 'loading'}
                className="sm:w-auto w-full"
                rightIcon={ArrowRight}
              >
                Подписаться
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Мы ценим вашу конфиденциальность. Вы можете отписаться в любое время.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
