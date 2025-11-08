// Animation variants for Framer Motion
import { Variants } from 'framer-motion';

// Standard timing
export const timing = {
  fast: 0.2,
  standard: 0.3,
  slow: 0.6,
  page: 0.8,
};

// Standard easing
export const easing = {
  ease: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: timing.standard,
      ease: easing.ease,
    },
  },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: {
    opacity: 0,
    transition: {
      duration: timing.standard,
      ease: easing.ease,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

// Scale animations
export const scale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

export const scaleDown: Variants = {
  hidden: { opacity: 0, scale: 1.2 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

// Rotation animations
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

export const rotateY: Variants = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

// Stagger animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: timing.standard,
      ease: easing.ease,
    },
  },
};

// Hover animations
export const hoverLift: Variants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easing.easeOut,
    },
  },
};

export const hoverGlow: Variants = {
  hover: {
    boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
    transition: {
      duration: 0.3,
      ease: easing.ease,
    },
  },
};

export const hoverScale: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: easing.easeOut,
    },
  },
};

export const hoverRotate: Variants = {
  hover: {
    rotate: 5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easing.easeOut,
    },
  },
};

// Special effects
export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: easing.easeInOut,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
};

export const glow: Variants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(59, 130, 246, 0.4)',
      '0 0 40px rgba(59, 130, 246, 0.8)',
      '0 0 20px rgba(59, 130, 246, 0.4)',
    ],
    transition: {
      duration: 2,
      ease: easing.easeInOut,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
};

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      ease: easing.easeInOut,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
};

// Page transitions
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: timing.standard,
      ease: easing.ease,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    y: -20,
    transition: {
      duration: timing.fast,
      ease: easing.ease,
    },
  },
};

// Modal animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: timing.standard,
      ease: easing.ease,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: timing.fast,
      ease: easing.ease,
    },
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 50,
    transition: {
      duration: timing.fast,
      ease: easing.ease,
    },
  },
};

// Button animations
export const buttonHover: Variants = {
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.2,
      ease: easing.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.1,
      ease: easing.easeIn,
    },
  },
};

// Ripple effect
export const ripple: Variants = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: easing.easeIn,
    },
  },
};

// Card animations
export const cardHover: Variants = {
  hover: {
    y: -8,
    scale: 1.02,
    rotateY: 5,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    },
  },
};

// Text reveal animations
export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: timing.standard,
      ease: easing.easeOut,
    },
  }),
};

// Progress bar animation
export const progressBar: Variants = {
  hidden: { width: '0%' },
  visible: (custom: number) => ({
    width: `${custom}%`,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
      delay: 0.2,
    },
  }),
};

// List animations
export const listStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: timing.standard,
      ease: easing.easeOut,
    },
  },
};

// Loading animations
export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

export const bounceDot: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: easing.easeInOut,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
};

// 3D tilt effect
export const tilt: Variants = {
  hover: {
    rotateX: 5,
    rotateY: 5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: easing.easeOut,
    },
  },
};

// Marquee animation
export const marquee: Variants = {
  animate: {
    x: ['0%', '-100%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop' as const,
        duration: 20,
        ease: 'linear',
      },
    },
  },
};

// Parallax animation
export const parallax: Variants = {
  hidden: { y: 0 },
  visible: (custom: number) => ({
    y: custom,
    transition: {
      duration: 0,
      ease: 'linear',
    },
  }),
};

// Custom animation presets
export const presets = {
  fast: {
    duration: timing.fast,
    ease: easing.ease,
  },
  standard: {
    duration: timing.standard,
    ease: easing.ease,
  },
  slow: {
    duration: timing.slow,
    ease: easing.ease,
  },
  bounce: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
};

export default {
  // Basic animations
  fadeIn,
  fadeOut,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scale,
  scaleDown,
  rotateIn,
  rotateY,

  // Stagger
  staggerContainer,
  staggerItem,

  // Hover effects
  hoverLift,
  hoverGlow,
  hoverScale,
  hoverRotate,

  // Special effects
  float,
  glow,
  pulse,

  // Transitions
  pageTransition,
  modalBackdrop,
  modalContent,
  buttonHover,
  ripple,
  cardHover,

  // Text and content
  textReveal,
  progressBar,

  // Lists and loading
  listStagger,
  listItem,
  spinner,
  bounceDot,

  // 3D and advanced
  tilt,
  marquee,
  parallax,

  // Presets
  presets,
};
