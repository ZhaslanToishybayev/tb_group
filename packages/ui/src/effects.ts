import { cn } from '../utils';
import { colors } from './colors';

// Эффекты TB Group
export interface EffectsProps {
  className?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadowColor?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'dark' | 'success' | 'warning' | 'info';
  hover?: boolean;
  focus?: boolean;
  active?: boolean;
  disabled?: boolean;
  transition?: 'none' | 'fast' | 'normal' | 'slow';
}

// Классы для теней
const shadows = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

// Классы для переходов
const transitions = {
  none: '',
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-300 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
};

// Классы для состояний
const states = {
  hover: 'hover:scale-105 hover:shadow-lg',
  focus: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  active: 'active:scale-95',
  disabled: 'opacity-50 cursor-not-allowed',
};

// Основной компонент эффектов
export const Effects = React.forwardRef<HTMLDivElement, EffectsProps>(
  ({ className, shadow = 'md', shadowColor = 'neutral', hover = false, focus = false, active = false, disabled = false, transition = 'normal', ...props }, ref
) => {
    const classes = cn(
      // Тени
      shadows[shadow],
      
      // Цвет тени
      shadow === 'none' ? '' : `shadow-${shadowColor}`,
      
      // Переходы
      transitions[transition],
      
      // Состояния
      hover && states.hover,
      focus && states.focus,
      active && states.active,
      disabled && states.disabled,
      
      className
    );

    return (
      <div ref={ref} className={classes} {...props}>
        {props.children}
      </div>
    );
  }
);

Effects.displayName = 'Effects';

// Специализированные компоненты для карточек
export const Card = React.forwardRef<HTMLDivElement, Omit<EffectsProps, 'shadow'>>(
  ({ className, shadow = 'md', shadowColor = 'neutral', hover = true, focus = false, active = false, disabled = false, transition = 'normal', ...props }, ref
) => (
    <Effects 
      ref={ref} 
      shadow={shadow} 
      shadowColor={shadowColor} 
      hover={hover} 
      focus={focus} 
      active={active} 
      disabled={disabled} 
      transition={transition}
      className={cn('rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800', className)}
      {...props}
    />
  )
);

Card.displayName = 'Card';

// Специализированные компоненты для кнопок
export const ButtonEffects = React.forwardRef<HTMLButtonElement, Omit<EffectsProps, 'shadow'>>(
  ({ className, shadow = 'md', shadowColor = 'primary', hover = true, focus = true, active = false, disabled = false, transition = 'normal', ...props }, ref
) => (
    <Effects 
      ref={ref} 
      shadow={shadow} 
      shadowColor={shadowColor} 
      hover={hover} 
      focus={focus} 
      active={active} 
      disabled={disabled} 
      transition={transition}
      className={cn('rounded-md border border-transparent', className)}
      {...props}
    />
  )
);

ButtonEffects.displayName = 'ButtonEffects';

// Специализированные компоненты для форм
export const InputEffects = React.forwardRef<HTMLInputElement, Omit<EffectsProps, 'shadow'>>(
  ({ className, shadow = 'sm', shadowColor = 'neutral', hover = true, focus = true, active = false, disabled = false, transition = 'normal', ...props }, ref
) => (
    <Effects 
      ref={ref} 
      shadow={shadow} 
      shadowColor={shadowColor} 
      hover={hover} 
      focus={focus} 
      active={active} 
      disabled={disabled} 
      transition={transition}
      className={cn('rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800', className)}
      {...props}
    />
  )
);

InputEffects.displayName = 'InputEffects';

// Специализированные компоненты для модальных окон
export const ModalEffects = React.forwardRef<HTMLDivElement, Omit<EffectsProps, 'shadow'>>(
  ({ className, shadow = 'xl', shadowColor = 'dark', hover = false, focus = false, active = false, disabled = false, transition = 'normal', ...props }, ref
) => (
    <Effects 
      ref={ref} 
      shadow={shadow} 
      shadowColor={shadowColor} 
      hover={hover} 
      focus={focus} 
      active={active} 
      disabled={disabled} 
      transition={transition}
      className={cn('rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800', className)}
      {...props}
    />
  )
);

ModalEffects.displayName = 'ModalEffects';

// Специализированные компоненты для навигации
export const NavEffects = React.forwardRef<HTMLDivElement, Omit<EffectsProps, 'shadow'>>(
  ({ className, shadow = 'none', shadowColor = 'neutral', hover = true, focus = false, active = false, disabled = false, transition = 'normal', ...props }, ref
) => (
    <Effects 
      ref={ref} 
      shadow={shadow} 
      shadowColor={shadowColor} 
      hover={hover} 
      focus={focus} 
      active={active} 
      disabled={disabled} 
      transition={transition}
      className={cn('border-b border-neutral-200 dark:border-neutral-700', className)}
      {...props}
    />
  )
);

NavEffects.displayName = 'NavEffects';

// Утилиты для создания кастомных эффектов
export const createCustomShadow = (x: number, y: number, blur: number, color: string) => {
  return `${x}px ${y}px ${blur}px ${color}`;
};

export const createCustomTransition = (property: string, duration: number, easing: string = 'ease-in-out') => {
  return `transition-${property} duration-${duration} ${easing}`;
};

export const createCustomHover = (scale: number = 1.05, shadow: string = 'shadow-lg') => {
  return `hover:scale-${scale} hover:${shadow}`;
};

export const createCustomFocus = (width: number = 2, color: string = 'primary') => {
  return `focus:outline-none focus:ring-${width} focus:ring-${color} focus:ring-offset-2`;
};

// Предопределенные эффекты
export const predefinedEffects = {
  // Эффекты для карточек
  card: {
    default: 'shadow-md hover:shadow-lg transition-all duration-300',
    elevated: 'shadow-lg hover:shadow-xl transition-all duration-300',
    floating: 'shadow-xl hover:shadow-2xl transition-all duration-300',
  },
  
  // Эффекты для кнопок
  button: {
    default: 'shadow-sm hover:shadow-md transition-all duration-300',
    primary: 'shadow-md hover:shadow-lg transition-all duration-300',
    secondary: 'shadow-sm hover:shadow-md transition-all duration-300',
    outline: 'shadow-none hover:shadow-sm transition-all duration-300',
  },
  
  // Эффекты для форм
  input: {
    default: 'shadow-sm focus:shadow-md transition-all duration-300',
    error: 'shadow-sm focus:shadow-red-500 transition-all duration-300',
    success: 'shadow-sm focus:shadow-green-500 transition-all duration-300',
  },
  
  // Эффекты для модальных окон
  modal: {
    default: 'shadow-xl transition-all duration-300',
    backdrop: 'bg-black bg-opacity-50 transition-all duration-300',
  },
  
  // Эффекты для навигации
  navigation: {
    default: 'hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-300',
    active: 'bg-primary text-white transition-all duration-300',
    dropdown: 'shadow-lg transition-all duration-300',
  },
};