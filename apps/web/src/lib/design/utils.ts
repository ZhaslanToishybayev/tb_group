// Design system utilities - Glassmorphism, Neumorphism, Gradients
// Simple className utility (could use clsx or class-variance-authority in real project)

// Utility for combining class names
export function cn(...inputs: any[]) {
  // This is a simple implementation - in a real project, you'd use clsx
  return inputs.filter(Boolean).join(' ');
}

// Glassmorphism utilities
export const glassmorphism = {
  // Light glass effect
  light: cn(
    'backdrop-blur-md',
    'bg-white/10',
    'border border-white/20'
  ),

  // Dark glass effect
  dark: cn(
    'backdrop-blur-md',
    'bg-black/20',
    'border border-white/10'
  ),

  // Strong glass effect
  strong: cn(
    'backdrop-blur-xl',
    'bg-white/15',
    'border border-white/30'
  ),

  // Subtle glass effect
  subtle: cn(
    'backdrop-blur-sm',
    'bg-white/5',
    'border border-white/10'
  ),

  // Glass button
  button: cn(
    'backdrop-blur-md',
    'bg-white/10',
    'border border-white/20',
    'hover:bg-white/20',
    'transition-all duration-300',
    'active:bg-white/30'
  ),

  // Glass card
  card: cn(
    'backdrop-blur-xl',
    'bg-white/10',
    'border border-white/20',
    'shadow-2xl',
    'shadow-black/5'
  ),

  // Glass modal
  modal: cn(
    'backdrop-blur-2xl',
    'bg-white/5',
    'border border-white/10',
    'shadow-2xl'
  )
};

// Neumorphism utilities
export const neumorphism = {
  // Soft neumorphism (raised)
  soft: cn(
    'bg-slate-800',
    'shadow-lg',
    'shadow-slate-900/50',
    'shadow-inner',
    'shadow-white/5'
  ),

  // Hard neumorphism (pressed)
  hard: cn(
    'bg-slate-800',
    'shadow-lg',
    'shadow-inset',
    'shadow-slate-900/50',
    'shadow-inner',
    'shadow-white/10'
  ),

  // Floating neumorphism
  floating: cn(
    'bg-slate-800',
    'shadow-xl',
    'shadow-2xl',
    'shadow-slate-900/60',
    'shadow-inner',
    'shadow-white/5',
    'hover:shadow-2xl',
    'hover:shadow-slate-900/70',
    'transition-all duration-300'
  ),

  // Flat neumorphism (subtle)
  flat: cn(
    'bg-slate-800',
    'shadow-md',
    'shadow-slate-900/40',
    'shadow-inner',
    'shadow-white/5'
  ),

  // Concave effect
  concave: cn(
    'bg-slate-800',
    'shadow-inset',
    'shadow-lg',
    'shadow-slate-900/60',
    'shadow-inner',
    'shadow-white/5'
  ),

  // Convex effect
  convex: cn(
    'bg-slate-800',
    'shadow-lg',
    'shadow-slate-900/50',
    'shadow-inner',
    'shadow-white/10'
  )
};

// Gradient utilities
export const gradients = {
  // Primary blue gradient
  primary: 'bg-gradient-to-br from-primary-500 to-primary-700',

  // Secondary purple gradient
  secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-700',

  // Neon gradient (cyan to magenta)
  neon: 'bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime',

  // Multi-color rainbow
  rainbow: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400',

  // Radial gradient
  radial: 'bg-gradient-radial from-primary-500 to-transparent',

  // Diagonal gradient
  diagonal: 'bg-gradient-to-br from-primary-500 via-secondary-500 to-neon-cyan',

  // Glass gradient
  glass: 'bg-gradient-to-br from-white/20 to-white/5',

  // Dark gradient
  dark: 'bg-gradient-to-br from-slate-900 to-slate-800',

  // Success gradient
  success: 'bg-gradient-to-br from-success-500 to-success-600',

  // Warning gradient
  warning: 'bg-gradient-to-br from-warning-500 to-warning-600',

  // Error gradient
  error: 'bg-gradient-to-br from-error-500 to-error-600'
};

// Text gradient utilities
export const textGradients = {
  primary: 'bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent',
  secondary: 'bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent',
  neon: 'bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-lime bg-clip-text text-transparent',
  rainbow: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent',
  glass: 'bg-gradient-to-r from-white/80 to-white/40 bg-clip-text text-transparent'
};

// Glow effects
export const glows = {
  // Primary glow
  primary: 'shadow-glow',

  // Violet glow
  violet: 'shadow-glow-purple',

  // Neon glow
  neon: 'shadow-[0_0_20px_rgba(0,245,255,0.5)]',

  // Soft glow
  soft: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',

  // Strong glow
  strong: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]',

  // Colored glows
  blue: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
  purple: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
  cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
  green: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
  yellow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
  red: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]'
};

// Hover effects
export const hoverEffects = {
  // Lift effect
  lift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300',

  // Scale effect
  scale: 'hover:scale-105 transition-transform duration-300',

  // Glow effect on hover
  glow: 'hover:shadow-glow transition-shadow duration-300',

  // Tilt effect
  tilt: 'hover:rotate-1 transition-transform duration-300',

  // Brightness effect
  brightness: 'hover:brightness-110 transition-all duration-300',

  // Saturation effect
  saturation: 'hover:saturate-110 transition-all duration-300',

  // Pulse effect
  pulse: 'hover:animate-pulse',

  // Bounce effect
  bounce: 'hover:animate-bounce'
};

// Animation utilities
export const animations = {
  // Fade in
  fadeIn: 'animate-[fadeIn_0.6s_ease-out_forwards]',

  // Slide up
  slideUp: 'animate-[slideUp_0.6s_ease-out_forwards]',

  // Scale in
  scaleIn: 'animate-[scaleIn_0.6s_ease-out_forwards]',

  // Float
  float: 'animate-float',

  // Glow
  glow: 'animate-glow',

  // Pulse
  pulse: 'animate-pulse-slow',

  // Bounce
  bounce: 'animate-bounce-slow',

  // Spin
  spin: 'animate-spin-slow'
};

// Layout utilities
export const layout = {
  // Flex center
  flexCenter: 'flex items-center justify-center',

  // Grid center
  gridCenter: 'grid place-items-center',

  // Absolute center
  absoluteCenter: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',

  // Full screen
  fullScreen: 'min-h-screen w-full',

  // Container
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',

  // Section spacing
  section: 'py-16 sm:py-20',

  // Card padding
  card: 'p-6 sm:p-8'
};

// Border utilities
export const borders = {
  // Glass border
  glass: 'border border-white/20',

  // Subtle border
  subtle: 'border border-white/10',

  // Strong border
  strong: 'border border-white/30',

  // Rounded corners
  rounded: 'rounded-2xl',
  roundedSm: 'rounded-xl',
  roundedLg: 'rounded-3xl',
  roundedFull: 'rounded-full',

  // Custom border radius
  custom: (radius: string) => `rounded-[${radius}]`
};

// Backdrop utilities
export const backdrops = {
  // Blur effects
  blur: 'backdrop-blur-sm',
  blurMd: 'backdrop-blur-md',
  blurLg: 'backdrop-blur-lg',
  blurXl: 'backdrop-blur-xl',
  blur2xl: 'backdrop-blur-2xl',

  // Backdrop brightness
  brightness: 'backdrop-brightness-110',
  brightnessLg: 'backdrop-brightness-125'
};

// Responsive utilities
export const responsive = {
  // Mobile first breakpoints
  sm: 'sm:text-base',
  md: 'md:text-lg',
  lg: 'lg:text-xl',
  xl: 'xl:text-2xl',
  '2xl': '2xl:text-3xl',

  // Spacing responsive
  space: 'space-y-4 sm:space-y-6 lg:space-y-8',

  // Grid responsive
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
};

// Accessibility utilities
export const accessibility = {
  // Screen reader only
  srOnly: 'sr-only',

  // Focus visible
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',

  // Skip link
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded',

  // High contrast
  highContrast: 'contrast-more:border-black contrast-more:text-black',

  // Reduced motion
  reducedMotion: 'motion-reduce:transition-none motion-reduce:animate-none'
};

// Dark mode utilities
export const darkMode = {
  // Auto dark mode
  auto: 'dark:text-white dark:bg-slate-900',

  // Forced dark mode
  forced: 'dark:text-white dark:bg-slate-900 forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]',

  // Inverted
  inverted: 'invert dark:invert-0'
};

// Custom CSS property utilities
export const cssVars = {
  // Animation duration
  duration: (value: string) => `--animation-duration: ${value}`,

  // Easing
  easing: (value: string) => `--animation-easing: ${value}`,

  // Z-index
  zIndex: (value: number) => `--z-index: ${value}`,

  // Spacing
  spacing: (value: string) => `--spacing: ${value}`,

  // Colors
  color: (name: string, value: string) => `--color-${name}: ${value}`,

  // Typography
  fontSize: (value: string) => `--font-size: ${value}`,
  fontWeight: (value: string) => `--font-weight: ${value}`,
  lineHeight: (value: string) => `--line-height: ${value}`
};

// Combined utility classes
export const componentStyles = {
  // Modern card
  modernCard: cn(
    glassmorphism.card,
    borders.roundedLg,
    layout.card,
    'hover:scale-[1.02]',
    'transition-all duration-300'
  ),

  // Button primary
  buttonPrimary: cn(
    gradients.primary,
    borders.rounded,
    layout.flexCenter,
    'px-6 py-3',
    'text-white font-semibold',
    'shadow-glow',
    hoverEffects.lift,
    'active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),

  // Glass button
  buttonGlass: cn(
    glassmorphism.button,
    borders.rounded,
    layout.flexCenter,
    'px-6 py-3',
    'text-white font-semibold',
    hoverEffects.scale,
    'active:scale-95'
  ),

  // Neon button
  buttonNeon: cn(
    'bg-neon-cyan',
    'text-black font-bold',
    borders.rounded,
    layout.flexCenter,
    'px-6 py-3',
    glows.neon,
    hoverEffects.glow,
    'active:scale-95'
  ),

  // Input field
  input: cn(
    'w-full',
    'px-4 py-3',
    'bg-slate-800/50',
    borders.subtle,
    borders.rounded,
    'text-white placeholder-slate-400',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'transition-all duration-300'
  ),

  // Hero section
  hero: cn(
    layout.fullScreen,
    layout.flexCenter,
    gradients.dark,
    'relative overflow-hidden'
  ),

  // Section
  section: cn(
    layout.section,
    gradients.dark
  ),

  // Container
  container: cn(
    layout.container,
    'relative z-10'
  )
};

// Export all utilities
export default {
  glassmorphism,
  neumorphism,
  gradients,
  textGradients,
  glows,
  hoverEffects,
  animations,
  layout,
  borders,
  backdrops,
  responsive,
  accessibility,
  darkMode,
  cssVars,
  componentStyles,
  cn
};
