// Custom animation hooks for Framer Motion
import { useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRef, useEffect, useState } from 'react';

// Hook for scroll-triggered animations
export const useScrollAnimation = (options = {}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    rootMargin: '-50px',
    ...options,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return [ref, controls] as const;
};

// Hook for staggered animations
export const useStaggerAnimation = (delay = 0.1) => {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
        delayChildren: delay,
      },
    },
  };
};

// Hook for hover animations
export const useHoverAnimation = () => {
  const controls = useAnimation();

  const handleHoverStart = () => {
    controls.start('hover');
  };

  const handleHoverEnd = () => {
    controls.start('initial');
  };

  return { controls, handleHoverStart, handleHoverEnd };
};

// Hook for 3D tilt effect
export const useTiltEffect = (maxTilt = 15) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      const rotateX = (-deltaY * maxTilt).toFixed(2);
      const rotateY = (deltaX * maxTilt).toFixed(2);

      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  return ref;
};

// Hook for parallax scrolling
export const useParallax = (speed = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      element.style.transform = `translateY(${rate}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
};

// Hook for lazy loading animations
export const useLazyAnimation = (threshold = 0.1) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return { ref, controls, inView };
};

// Hook for typing animation
export const useTypingAnimation = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  const restart = () => {
    setDisplayText('');
    setCurrentIndex(0);
  };

  return { displayText, isComplete: currentIndex >= text.length, restart };
};

// Hook for spring animation
export const useSpringAnimation = (initial = 0) => {
  const controls = useAnimation();

  const springTo = (value: number, config = {}) => {
    controls.start({
      x: value,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
        ...config,
      },
    });
  };

  return { controls, springTo };
};

// Hook for gesture animations (drag, pan, etc.)
export const useGestures = () => {
  const controls = useAnimation();

  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset;
    const velocity = info.velocity;

    // Spring back animation
    controls.start({
      x: 0,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    });
  };

  return { controls, handleDragEnd };
};

// Hook for viewport animations with custom triggers
export const useViewportAnimation = (variants: any, options = {}) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  return { ref, controls };
};

// Hook for sequential animations
export const useSequentialAnimation = (animations: any[], delay = 0) => {
  const controls = useAnimation();
  const [currentAnimation, setCurrentAnimation] = useState(0);

  const playSequence = async () => {
    for (let i = 0; i < animations.length; i++) {
      setCurrentAnimation(i);
      await controls.start(animations[i]);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };

  return { controls, currentAnimation, playSequence };
};

// Hook for animation variants based on state
export const useVariantAnimation = (state: string, variants: Record<string, any>) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(state);
  }, [controls, state]);

  return controls;
};

// Hook for performance-optimized animations
export const useOptimizedAnimation = () => {
  const controls = useAnimation();

  // Optimize for 60fps
  const animate = (variant: any) => {
    controls.start(variant, {
      type: 'tween',
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    });
  };

  return { controls, animate };
};

// Hook for reduced motion accessibility
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook for animation duration based on distance
export const useDynamicDuration = (distance: number) => {
  const baseDuration = 300; // base duration in ms
  const distanceMultiplier = Math.min(Math.max(distance / 100, 0.5), 2); // clamp between 0.5x and 2x

  return baseDuration * distanceMultiplier;
};

// Hook for stagger animations with dynamic delays
export const useDynamicStagger = (itemCount: number, baseDelay = 0.1) => {
  const staggerChildren = Array.from({ length: itemCount }, (_, i) => i * baseDelay);

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
      },
    },
  };
};

export default {
  useScrollAnimation,
  useStaggerAnimation,
  useHoverAnimation,
  useTiltEffect,
  useParallax,
  useLazyAnimation,
  useTypingAnimation,
  useSpringAnimation,
  useGestures,
  useViewportAnimation,
  useSequentialAnimation,
  useVariantAnimation,
  useOptimizedAnimation,
  useReducedMotion,
  useDynamicDuration,
  useDynamicStagger,
};
