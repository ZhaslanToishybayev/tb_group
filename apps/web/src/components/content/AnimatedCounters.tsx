'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export type CounterItem = {
  id: string;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  description?: string;
};

type AnimatedCountersProps = {
  items: CounterItem[];
};

function Counter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      let startTime: number;
      const startValue = 0;
      const endValue = value;
      const totalFrames = duration * 60; // 60fps

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / 1000 / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const currentCount = Math.floor(easedProgress * (endValue - startValue) + startValue);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

export function AnimatedCounters({ items }: AnimatedCountersProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ delay: index * 0.1, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          className="text-center p-6 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-blue-500/30 hover:bg-slate-900/80 transition-all group"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 100 }}
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-3 group-hover:from-blue-300 group-hover:to-blue-500 transition-all"
          >
            <Counter
              value={item.value}
              suffix={item.suffix}
              prefix={item.prefix}
              duration={2}
            />
          </motion.div>
          <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
          {item.description && (
            <p className="text-sm text-slate-400">{item.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
