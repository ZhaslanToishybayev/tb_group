'use client';

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  buttonVariant?: 'primary' | 'secondary';
};

type PricingTableProps = {
  tiers: PricingTier[];
};

export function PricingTable({ tiers }: PricingTableProps) {
  const { ref, motionProps } = useScrollAnimation('fadeIn', {
    threshold: 0.1,
  });

  return (
    <div ref={ref} {...motionProps}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -5 }}
            className={`relative rounded-3xl border ${
              tier.isPopular
                ? 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-slate-900/60'
                : 'border-white/10 bg-slate-900/60'
            } p-8 shadow-xl hover:shadow-2xl transition-all group`}
          >
            {tier.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <Star size={14} fill="currentColor" />
                  <span>Популярный</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-sm text-slate-400">{tier.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                {tier.period && (
                  <span className="text-sm text-slate-400">/{tier.period}</span>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((feature, featureIndex) => (
                <motion.li
                  key={featureIndex}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                    <Check size={12} className="text-blue-400" />
                  </div>
                  <span className="text-slate-300">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full rounded-xl px-6 py-3 font-semibold transition-all ${
                tier.isPopular || tier.buttonVariant === 'primary'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {tier.buttonText || 'Выбрать тариф'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
