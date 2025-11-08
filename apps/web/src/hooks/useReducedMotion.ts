import { useState, useEffect } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  return prefersReducedMotion;
}

// Hook for conditional animation variants
export function useAnimationVariants(variants: any) {
  const prefersReducedMotion = useReducedMotion();

  const adjustedVariants = {
    ...variants,
    ...(prefersReducedMotion && {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.3, ease: 'linear' },
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.2, ease: 'linear' },
      },
    }),
  };

  return adjustedVariants;
}

export default useReducedMotion;
