// Цветовая схема TB Group
export const colors = {
  // Основные цвета бренда
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Основной цвет бренда
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Вторичный цвет бренда
  secondary: {
    50: '#fff7ed',
    100: '#feebc8',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Вторичный цвет бренда
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // Акцентный цвет
  accent: {
    50: '#e0f2fe',
    100: '#bae6fd',
    200: '#7dd3fc',
    300: '#38bdf8',
    400: '#0ea5e9',
    500: '#0ea5e9', // Акцентный цвет
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#164e63',
  },
  
  // Нейтральные цвета
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#4b5563',
    800: '#374151',
    900: '#1c1917',
    950: '#0c0a09',
  },
  
  // Темные цвета
  dark: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Статусные цвета
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Цвета для границ
  border: {
    primary: '#2563eb',
    secondary: '#f59e0b',
    accent: '#0ea5e9',
    neutral: '#e5e5e5',
    dark: '#374151',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  // Цвета для фона
  background: {
    primary: '#2563eb',
    secondary: '#f59e0b',
    accent: '#0ea5e9',
    neutral: '#ffffff',
    dark: '#111827',
    success: '#22c55e',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  // Цвета для текста
  text: {
    primary: '#ffffff',
    secondary: '#ffffff',
    accent: '#ffffff',
    neutral: '#111827',
    dark: '#ffffff',
    success: '#ffffff',
    warning: '#ffffff',
    info: '#ffffff',
  },
  
  // Цвета для теней
  shadow: {
    primary: '0 4px 6px -1px rgba(37, 99, 235, 0.1)',
    secondary: '0 4px 6px -1px rgba(245, 158, 11, 0.1)',
    accent: '0 4px 6px -1px rgba(14, 165, 233, 0.1)',
    neutral: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    dark: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    success: '0 4px 6px -1px rgba(34, 197, 94, 0.1)',
    warning: '0 4px 6px -1px rgba(245, 158, 11, 0.1)',
    info: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
  },
};

// Типы для цветовой схемы
export type ColorType = keyof typeof colors;

// Утилиты для работы с цветами
export const getColorClass = (color: ColorType, shade: number = 500) => {
  return colors[color][shade as keyof typeof colors[color]];
};

export const getTextColorClass = (color: ColorType, shade: number = 500) => {
  // Определяем светлый или темный фон
  const isLight = shade < 400;
  return isLight ? 'text-neutral-900' : 'text-neutral-100';
};

export const getBorderColorClass = (color: ColorType, shade: number = 500) => {
  return colors.border[color];
};

export const getBackgroundColorClass = (color: ColorType, shade: number = 500) => {
  return colors.background[color];
};

export const getShadowClass = (color: ColorType, shade: number = 500) => {
  return colors.shadow[color];
};