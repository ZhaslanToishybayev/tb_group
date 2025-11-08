'use client';

import { ReactNode } from 'react';

interface MicroAnimationsProps {
  children: ReactNode;
  className?: string;
}

export function MicroAnimations({ children, className = '' }: MicroAnimationsProps) {
  return (
    <div className={`group ${className}`}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="h-px w-px bg-white transform rotate-45 origin-left"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-px bg-white transform rotate-45 origin-left"></div>
        </div>
      </div>
      {children}
    </div>
  );
}

// Hover эффект для карточек
export function CardHover({ children, className = '' }: MicroAnimationsProps) {
  return (
    <div className={`group ${className}`}>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300">
        {children}
      </div>
    </div>
  );
}

// Пульсирующая анимация
export function PulseAnimation({ children, className = '' }: MicroAnimationsProps) {
  return (
    <div className={`group ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-blue-600 rounded-full opacity-75 animate-ping"></div>
        </div>
        {children}
      </div>
    </div>
  );
}

// Fade-in анимация
export function FadeIn({ children, className = '' }: MicroAnimationsProps) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

// Slide-in анимация
export function SlideIn({ children, className = '', direction = 'left' }: MicroAnimationsProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const directionClasses = {
    left: 'translate-x-[-100%] opacity-0',
    right: 'translate-x-[100%] opacity-0',
    up: 'translate-y-[-100%] opacity-0',
    down: 'translate-y-[100%] opacity-0'
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`transform ${directionClasses[direction]} transition-all duration-500 ease-out animate-slide-in`}>
        {children}
      </div>
    </div>
  );
}