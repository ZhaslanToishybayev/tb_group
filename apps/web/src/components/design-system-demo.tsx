'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  fadeInUp,
  staggerContainer,
  cardHover,
  buttonHover,
  hoverLift,
  hoverGlow
} from './animations/variants';
import {
  glassmorphism,
  gradients,
  textGradients,
  componentStyles,
  glows,
  hoverEffects,
  animations
} from '../lib/design/utils';

// Demo component showcasing the new design system
export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <motion.div
        className="text-center mb-16"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1
          className="text-6xl font-bold mb-4"
          variants={fadeInUp}
        >
          <span className={textGradients.neon}>TB Group</span>
        </motion.h1>
        <motion.p
          className="text-xl text-slate-300"
          variants={fadeInUp}
        >
          Design System 2025 - Modern UX/UI Components
        </motion.p>
      </motion.div>

      {/* Glassmorphism Demo */}
      <motion.section
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl font-bold mb-8 text-center"
          variants={fadeInUp}
        >
          <span className={textGradients.primary}>Glassmorphism</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className={`${glassmorphism.light} p-6 rounded-2xl`}
            variants={fadeInUp}
            whileHover="hover"
          >
            <h3 className="text-lg font-semibold mb-2">Light Glass</h3>
            <p className="text-sm text-slate-300">Subtle transparency with backdrop blur</p>
          </motion.div>

          <motion.div
            className={`${glassmorphism.dark} p-6 rounded-2xl`}
            variants={fadeInUp}
            whileHover="hover"
          >
            <h3 className="text-lg font-semibold mb-2">Dark Glass</h3>
            <p className="text-sm text-slate-300">Elegant dark glassmorphism effect</p>
          </motion.div>

          <motion.div
            className={`${glassmorphism.strong} p-6 rounded-2xl`}
            variants={fadeInUp}
            whileHover="hover"
          >
            <h3 className="text-lg font-semibold mb-2">Strong Glass</h3>
            <p className="text-sm text-slate-300">High intensity glass effect</p>
          </motion.div>

          <motion.div
            className={`${glassmorphism.card} p-6 rounded-2xl`}
            variants={fadeInUp}
            whileHover="hover"
          >
            <h3 className="text-lg font-semibold mb-2">Glass Card</h3>
            <p className="text-sm text-slate-300">Perfect for content cards</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Button Variants Demo */}
      <motion.section
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl font-bold mb-8 text-center"
          variants={fadeInUp}
        >
          <span className={textGradients.secondary}>Button Variants</span>
        </motion.h2>

        <div className="flex flex-wrap gap-6 justify-center">
          <motion.button
            className={componentStyles.buttonPrimary}
            variants={fadeInUp}
            whileHover="hover"
            whileTap="tap"
          >
            Primary Button
          </motion.button>

          <motion.button
            className={componentStyles.buttonGlass}
            variants={fadeInUp}
            whileHover="hover"
            whileTap="tap"
          >
            Glass Button
          </motion.button>

          <motion.button
            className={componentStyles.buttonNeon}
            variants={fadeInUp}
            whileHover="hover"
            whileTap="tap"
          >
            Neon Button
          </motion.button>

          <motion.button
            className={`${glassmorphism.subtle} px-6 py-3 rounded-xl font-semibold text-white border border-white/20 ${hoverEffects.lift} ${hoverEffects.glow}`}
            variants={fadeInUp}
          >
            Custom Button
          </motion.button>
        </div>
      </motion.section>

      {/* Gradient Text Demo */}
      <motion.section
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl font-bold mb-8 text-center"
          variants={fadeInUp}
        >
          <span className={textGradients.neon}>Text Gradients</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className={`${componentStyles.modernCard} text-center`}
            variants={fadeInUp}
          >
            <h3 className={`text-2xl font-bold mb-4 ${textGradients.primary}`}>
              Primary Gradient
            </h3>
            <p className="text-slate-300">
              Perfect for headings and emphasis
            </p>
          </motion.div>

          <motion.div
            className={`${componentStyles.modernCard} text-center`}
            variants={fadeInUp}
          >
            <h3 className={`text-2xl font-bold mb-4 ${textGradients.neon}`}>
              Neon Gradient
            </h3>
            <p className="text-slate-300">
              Eye-catching and modern
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Cards with Hover Effects */}
      <motion.section
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl font-bold mb-8 text-center"
          variants={fadeInUp}
        >
          <span className={textGradients.rainbow}>Interactive Cards</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className={`${componentStyles.modernCard} cursor-pointer`}
            variants={fadeInUp}
            whileHover="hover"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold">Card with Lift</h3>
            </div>
            <p className="text-slate-300">
              Hover to see the card lift effect with enhanced shadow
            </p>
          </motion.div>

          <motion.div
            className={`${componentStyles.modernCard} cursor-pointer`}
            variants={fadeInUp}
            whileHover="hover"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold">Card with Glow</h3>
            </div>
            <p className="text-slate-300">
              Hover to see the subtle glow effect around the card
            </p>
          </motion.div>

          <motion.div
            className={`${componentStyles.modernCard} cursor-pointer`}
            variants={fadeInUp}
            whileHover="hover"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan via-neon-magenta to-neon-lime flex items-center justify-center">
                <span className="text-black font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold">Neon Card</h3>
            </div>
            <p className="text-slate-300">
              A card with a vibrant neon gradient accent
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Animation Showcase */}
      <motion.section
        className="mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.h2
          className="text-3xl font-bold mb-8 text-center"
          variants={fadeInUp}
        >
          <span className={textGradients.glass}>Animation Showcase</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            className={`${componentStyles.modernCard} text-center cursor-pointer`}
            variants={fadeInUp}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold"
              animate={animations.float}
            >
              ⚡
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Float Animation</h3>
            <p className="text-sm text-slate-300">Continuous floating effect</p>
          </motion.div>

          <motion.div
            className={`${componentStyles.modernCard} text-center cursor-pointer`}
            variants={fadeInUp}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center text-white text-2xl font-bold"
              animate={animations.glow}
            >
              ✨
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Glow Animation</h3>
            <p className="text-sm text-slate-300">Pulsing glow effect</p>
          </motion.div>

          <motion.div
            className={`${componentStyles.modernCard} text-center cursor-pointer`}
            variants={fadeInUp}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-cyan to-neon-lime flex items-center justify-center text-black text-2xl font-bold"
              animate={animations.pulse}
            >
              💫
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Pulse Animation</h3>
            <p className="text-sm text-slate-300">Gentle pulsing effect</p>
          </motion.div>

          <motion.div
            className={`${componentStyles.modernCard} text-center cursor-pointer`}
            variants={fadeInUp}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center text-white text-2xl font-bold"
              animate={animations.bounce}
            >
              🎯
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">Bounce Animation</h3>
            <p className="text-sm text-slate-300">Playful bounce effect</p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className={`${componentStyles.modernCard} max-w-2xl mx-auto`}>
          <h2 className={`text-3xl font-bold mb-4 ${textGradients.primary}`}>
            Ready to Use Design System
          </h2>
          <p className="text-slate-300 mb-8">
            All utilities, variants, and components are ready to be used across your application.
            Check the Task Master for next steps!
          </p>
          <motion.button
            className={`${gradients.primary} px-8 py-4 rounded-xl font-bold text-white shadow-glow-lg hover:shadow-glow-xl transition-all duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue to Next Task
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
