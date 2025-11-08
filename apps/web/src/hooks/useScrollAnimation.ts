'use client';

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRef } from 'react';

type AnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'stagger';

interface UseScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
}

export function useScrollAnimation(
  type: AnimationType = 'fadeIn',
  options: UseScrollAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    triggerOnce = true,
    delay = 0,
    duration = 0.6,
    staggerChildren = 0.1,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold,
    triggerOnce,
  });

  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    ref.current = element;
    inViewRef(element);
  };

  // Define animation variants
  const getVariants = (): Variants => {
    switch (type) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration, delay },
          },
        };

      case 'slideUp':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay },
          },
        };

      case 'slideLeft':
        return {
          hidden: { opacity: 0, x: 50 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay },
          },
        };

      case 'slideRight':
        return {
          hidden: { opacity: 0, x: -50 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay },
          },
        };

      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration, delay },
          },
        };

      case 'stagger':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren,
              delayChildren: delay,
            },
          },
        };

      default:
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration, delay },
          },
        };
    }
  };

  const variants = getVariants();

  return {
    ref: setRefs,
    inView,
    variants,
    motionProps: {
      initial: 'hidden',
      animate: inView ? 'visible' : 'hidden',
      variants,
    },
  };
}

// Helper hook for list items with stagger
export function useStaggerContainer(itemCount: number, staggerDelay: number = 0.1) {
  const { ref, inView, variants } = useScrollAnimation('fadeIn', {
    triggerOnce: true,
    staggerChildren: staggerDelay,
  });

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return {
    ref,
    inView,
    variants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    },
    itemVariants,
    motionProps: {
      initial: 'hidden',
      animate: inView ? 'visible' : 'hidden',
      variants,
    },
  };
}
