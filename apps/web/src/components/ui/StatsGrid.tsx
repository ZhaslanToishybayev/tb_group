'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Stat {
  id: string;
  value: number;
  label: string;
  suffix?: string;
  icon?: React.ComponentType<any>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'neon';
}

interface StatsGridProps {
  stats: Stat[];
  className?: string;
  columns?: 2 | 3 | 4;
}

const colorMap = {
  primary: 'text-primary-400',
  secondary: 'text-secondary-400',
  success: 'text-success-400',
  warning: 'text-warning-400',
  neon: 'text-neon-cyan',
};

export function StatsGrid({ stats, className, columns = 4 }: StatsGridProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns];

  return (
    <div ref={ref} className={`grid ${gridCols} gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={stat.id} stat={stat} index={index} inView={inView} />
      ))}
    </div>
  );
}

function StatCard({ stat, index, inView }: { stat: Stat; index: number; inView: boolean }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (inView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = stat.value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCount(stat.value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [inView, stat.value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative p-6 rounded-xl bg-slate-800/50 border border-white/10 hover:border-white/20 transition-colors group"
    >
      <div className="flex items-start gap-4">
        {stat.icon && (
          <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
            <stat.icon className={`h-6 w-6 ${colorMap[stat.color || 'primary']}`} />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <motion.span
              className={`text-3xl font-bold ${colorMap[stat.color || 'primary']}`}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
            >
              {count.toLocaleString()}
            </motion.span>
            {stat.suffix && (
              <span className={`text-3xl font-bold ${colorMap[stat.color || 'primary']}`}>
                {stat.suffix}
              </span>
            )}
          </div>
          <p className="text-slate-300 text-sm mt-2">{stat.label}</p>
        </div>
      </div>
    </motion.div>
  );
}
