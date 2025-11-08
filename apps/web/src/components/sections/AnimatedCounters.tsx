'use client';

import React, { useEffect, useState } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';
import { useRef } from 'react';

interface CounterData {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

interface AnimatedCountersProps {
  data: CounterData[];
  className?: string;
}

export function AnimatedCounters({ data, className = '' }: AnimatedCountersProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
      {data.map((item, index) => (
        <CounterItem key={item.label} item={item} index={index} />
      ))}
    </div>
  );
}

function CounterItem({ item, index }: { item: CounterData; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, item.value, {
        duration: 2,
        ease: 'easeOut',
      });

      const unsubscribe = motionValue.on('change', (latest) => {
        setDisplayValue(Math.round(latest));
      });

      return () => {
        controls.stop();
        unsubscribe();
      };
    }
  }, [isInView, motionValue, item.value]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-neon-cyan bg-clip-text text-transparent mb-2">
        {item.prefix}
        {formatNumber(displayValue)}
        {item.suffix}
      </div>
      <p className="text-slate-400 text-lg font-medium">{item.label}</p>
    </motion.div>
  );
}
