'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';

type LenisContextType = {
  lenis: Lenis | null;
};

const LenisContext = createContext<LenisContextType>({
  lenis: null,
});

export function useLenis() {
  return useContext(LenisContext);
}

type LenisProviderProps = {
  children: React.ReactNode;
  options?: ConstructorParameters<typeof Lenis>[0];
};

export function LenisProvider({ children, options }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
      ...options,
    });

    lenisRef.current = lenis;

    // Animation frame loop
    let rafId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const value = {
    lenis: lenisRef.current,
  };

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>;
}
