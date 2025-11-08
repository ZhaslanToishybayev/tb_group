import React from 'react';
import { cn } from '../utils';

// Типографика TB Group с весовыми категориями
export interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'thin' | 'regular' | 'medium' | 'bold' | 'black';
  as?: keyof JSX.IntrinsicElements;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  color?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'dark' | 'success' | 'warning' | 'info';
}

// Классы для весов шрифтов
const fontWeights = {
  thin: 'font-thin',
  regular: 'font-normal',
  medium: 'font-medium',
  bold: 'font-bold',
  black: 'font-black',
};

// Классы для размеров
const fontSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

// Классы для цветов
const fontColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  neutral: 'text-neutral',
  dark: 'text-dark',
  success: 'text-success',
  warning: 'text-warning',
  info: 'text-info',
};

// Основной компонент типографики
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ children, className, variant = 'regular', as: Component = 'p', size = 'base', color = 'neutral', ...props }, ref
) => {
    const classes = cn(
      // Базовые классы
      'font-sans', // Inter шрифт
      'leading-relaxed', // Улучшенный line-height
      'tracking-tight', // Улучшенный letter-spacing
      
      // Вес шрифта
      fontWeights[variant],
      
      // Размер шрифта
      fontSizes[size],
      
      // Цвет текста
      fontColors[color],
      
      className
    );

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

// Специализированные компоненты для заголовков
export const H1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="black" size="4xl" as="h1" {...props} />
  )
);

H1.displayName = 'H1';

export const H2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="bold" size="3xl" as="h2" {...props} />
  )
);

H2.displayName = 'H2';

export const H3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="medium" size="2xl" as="h3" {...props} />
  )
);

H3.displayName = 'H3';

export const H4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="medium" size="xl" as="h4" {...props} />
  )
);

H4.displayName = 'H4';

export const H5 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="lg" as="h5" {...props} />
  )
);

H5.displayName = 'H5';

export const H6 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="base" as="h6" {...props} />
  )
);

H6.displayName = 'H6';

// Специализированные компоненты для текста
export const Body = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="base" as="p" {...props} />
  )
);

Body.displayName = 'Body';

export const Small = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="sm" as="p" {...props} />
  )
);

Small.displayName = 'Small';

export const Large = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="lg" as="p" {...props} />
  )
);

Large.displayName = 'Large';

// Компонент для цитат
export const Quote = React.forwardRef<HTMLQuoteElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="base" as="blockquote" className="border-l-4 border-primary pl-4 italic" {...props} />
  )
);

Quote.displayName = 'Quote';

// Компонент для кода
export const Code = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="sm" as="code" className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md font-mono text-neutral-800 dark:text-neutral-200" {...props} />
  )
);

Code.displayName = 'Code';

// Компонент для ссылок
export const Link = React.forwardRef<HTMLAnchorElement, Omit<TypographyProps, 'variant' | 'size'>>(
  (props, ref) => (
    <Typography ref={ref} variant="regular" size="base" as="a" className="text-primary hover:text-accent transition-colors duration-300 underline" {...props} />
  )
);

Link.displayName = 'Link';