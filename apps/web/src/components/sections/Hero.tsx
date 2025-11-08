'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HeroBackground from '../three/HeroBackground';
import { useTypewriter } from '../../hooks/useTypewriter';
import { Button } from '../ui/Button';
import AnimatedCounters from './AnimatedCounters';

export default function Hero() {
  const headline = 'Transform Your Business with Cutting-Edge Solutions';
  const { displayText, isComplete } = useTypewriter(headline, 80);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Stats data for animated counters
  const stats = [
    { value: 500, label: 'Happy Clients', suffix: '+' },
    { value: 1000, label: 'Projects Completed', suffix: '+' },
    { value: 99, label: 'Client Satisfaction', suffix: '%' },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <HeroBackground />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center space-y-8">
          {/* Main Headline */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="block">
              {displayText}
              {!isComplete && (
                <span className="inline-block w-1 h-[1em] bg-primary-500 ml-2 animate-pulse" />
              )}
            </span>
          </motion.h1>

          {/* Gradient underline */}
          <motion.div
            className="h-1 w-32 bg-gradient-to-r from-primary-500 via-secondary-500 to-neon-cyan mx-auto rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 128, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          />

          {/* Subheadline */}
          <motion.p
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            We deliver innovative cloud solutions, seamless integrations, and cutting-edge technology
            to accelerate your business growth in the digital age.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Button
              variant="gradient"
              size="lg"
              glow="large"
              onClick={() => scrollToSection('#contact')}
              className="min-w-[200px]"
            >
              Get Started Today
            </Button>
            <Button
              variant="neon"
              size="lg"
              onClick={() => scrollToSection('#services')}
              className="min-w-[200px]"
            >
              Explore Services
            </Button>
          </motion.div>

          {/* Animated Stats Counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <AnimatedCounters data={stats} className="pt-16" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-1 h-3 bg-primary-500 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
