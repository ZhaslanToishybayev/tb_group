'use client';

import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { Calendar, Award, Target, Users } from 'lucide-react';

export type StoryParagraph = {
  id: string;
  text: string;
  highlight?: boolean;
};

export type Milestone = {
  id: string;
  year: string;
  title: string;
  description: string;
};

type CompanyStoryProps = {
  title: string;
  subtitle?: string;
  paragraphs: StoryParagraph[];
  milestones?: Milestone[];
};

export function CompanyStory({ title, subtitle, paragraphs, milestones }: CompanyStoryProps) {
  const { ref, motionProps } = useScrollAnimation('fadeIn', {
    threshold: 0.1,
  });

  return (
    <div ref={ref} {...motionProps} className="space-y-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
        {subtitle && (
          <p className="text-lg text-slate-300 leading-relaxed">{subtitle}</p>
        )}
      </motion.div>

      {/* Story paragraphs */}
      <div className="space-y-8">
        {paragraphs.map((paragraph, index) => (
          <motion.div
            key={paragraph.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className={`max-w-4xl mx-auto ${
              paragraph.highlight
                ? 'text-xl md:text-2xl text-blue-300 font-medium'
                : 'text-lg text-slate-300'
            } leading-relaxed`}
          >
            {paragraph.highlight ? (
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-transparent p-6 md:p-8">
                <p>{paragraph.text}</p>
              </div>
            ) : (
              <p>{paragraph.text}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
        <div className="mt-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-white mb-12 text-center"
          >
            Ключевые этапы развития
          </motion.h3>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Year badge */}
                <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <div className="text-center">
                    <Calendar size={24} className="mx-auto mb-2 text-white" />
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {milestone.year}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:p-8 hover:border-blue-500/30 transition-all">
                  <h4 className="text-xl md:text-2xl font-bold text-white mb-3">
                    {milestone.title}
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
