'use client';

import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Check } from 'lucide-react';

export type ProcessStep = {
  id: number;
  title: string;
  description: string;
  duration?: string;
};

type ProcessTimelineProps = {
  steps: ProcessStep[];
};

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const { ref, motionProps } = useScrollAnimation('slideUp', {
    threshold: 0.1,
  });

  return (
    <div ref={ref} {...motionProps} className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-blue-400 to-transparent transform md:-translate-x-1/2" />

      <div className="space-y-12">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className={`relative flex items-center ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* Timeline dot */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
              className="absolute left-4 md:left-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center transform md:-translate-x-1/2 z-10 shadow-lg shadow-blue-500/30"
            >
              <Check size={16} className="text-white" />
            </motion.div>

            {/* Content card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`ml-16 md:ml-0 ${
                index % 2 === 0 ? 'md:mr-8 md:ml-0' : 'md:ml-8'
              } md:w-1/2`}
            >
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl hover:border-blue-500/30 hover:shadow-blue-500/10 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">
                    {step.id}
                  </span>
                  {step.duration && (
                    <span className="text-xs text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                      {step.duration}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
