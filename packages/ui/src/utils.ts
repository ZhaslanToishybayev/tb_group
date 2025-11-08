import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Утилита для объединения классов с Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
