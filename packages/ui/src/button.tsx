import React from 'react';
import { cn } from '../utils';
import { colors } from '../colors';
import { spacing } from '../spacing';

// Интерфейс для кнопок TB Group
export interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

// Классы для вариантов кнопок
const buttonVariants = {
  primary: {
    default: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-2 focus:ring-primary focus:ring-offset-2',
    disabled: 'bg-primary-300 text-primary-500 cursor-not-allowed',
  },
  secondary: {
    default: 'bg-secondary text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-2 focus:ring-secondary focus:ring-offset-2',
    disabled: 'bg-secondary-300 text-secondary-500 cursor-not-allowed',
  },
  outline: {
    default: 'bg-transparent text-primary border border-primary hover:bg-primary-50 active:bg-primary-100 focus:ring-2 focus:ring-primary focus:ring-offset-2',
    disabled: 'bg-transparent text-primary-300 border border-primary-300 cursor-not-allowed',
  },
  ghost: {
    default: 'bg-transparent text-primary hover:bg-primary-50 active:bg-primary-100 focus:ring-2 focus:ring-primary focus:ring-offset-2',
    disabled: 'bg-transparent text-primary-300 cursor-not-allowed',
  },
};

// Классы для размеров кнопок
const buttonSizes = {
  xs: {
    padding: `${spacing[1]} ${spacing[2]}`, // 4px 8px
    fontSize: 'text-xs',
    minHeight: 'h-8',
  },
  sm: {
    padding: `${spacing[2]} ${spacing[3]}`, // 8px 12px
    fontSize: 'text-sm',
    minHeight: 'h-10',
  },
  md: {
    padding: `${spacing[2]} ${spacing[4]}`, // 8px 16px
    fontSize: 'text-base',
    minHeight: 'h-12',
  },
  lg: {
    padding: `${spacing[3]} ${spacing[6]}`, // 12px 24px
    fontSize: 'text-lg',
    minHeight: 'h-14',
  },
  xl: {
    padding: `${spacing[4]} ${spacing[8]}`, // 16px 32px
    fontSize: 'text-xl',
    minHeight: 'h-16',
  },
};

// Классы для скругления углов
const buttonRounded = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

// Основной компонент кнопок
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    className, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false, 
    icon, 
    iconPosition = 'left',
    onClick,
    type = 'button',
    fullWidth = false,
    rounded = 'md',
    ...props 
  }, ref
) => {
    const baseClasses = cn(
      // Базовые классы
      'inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out',
      
      // Размер кнопки
      buttonSizes[size].padding,
      buttonSizes[size].fontSize,
      buttonSizes[size].minHeight,
      
      // Скругление углов
      buttonRounded[rounded],
      
      // Ширина
      fullWidth ? 'w-full' : '',
      
      // Состояния
      disabled ? buttonVariants[variant].disabled : buttonVariants[variant].default,
      
      // Фокус
      'focus:outline-none',
      
      // Курсор
      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      
      className
    );

    const iconClasses = cn(
      'flex items-center',
      iconPosition === 'right' ? 'ml-2' : 'mr-2'
    );

    const loadingClasses = cn(
      'animate-spin h-4 w-4'
    );

    return (
      <button
        ref={ref}
        type={type}
        className={baseClasses}
        onClick={disabled || loading ? undefined : onClick}
        disabled={disabled || loading}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className={iconClasses}>
            {icon}
          </span>
        )}
        
        {loading ? (
          <svg className={loadingClasses} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 018 0 018 8 0 01-1 1-1 1 0-.393.393-1.415-1.415L8.586 10.414a2 2 0 002.828 0 01-1.414-1.414L10.414 8.586A2 2 0 001-1.414-1.414 01-1.414-1.414 01-.393.393-1.415-1.415L15.586 13.586A2 2 0 0014.172 0 01.414 1.414 01.414 1.414 01.393.393 1.415-1.415z"></path>
          </svg>
        ) : (
          <span className="flex items-center">
            {children}
          </span>
        )}
        
        {icon && iconPosition === 'right' && (
          <span className={iconClasses}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Специализированные компоненты для кнопок
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button ref={ref} variant="primary" {...props} />
  )
);

PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button ref={ref} variant="secondary" {...props} />
  )
);

SecondaryButton.displayName = 'SecondaryButton';

export const OutlineButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button ref={ref} variant="outline" {...props} />
  )
);

OutlineButton.displayName = 'OutlineButton';

export const GhostButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => (
    <Button ref={ref} variant="ghost" {...props} />
  )
);

GhostButton.displayName = 'GhostButton';

// Компонент для группы кнопок
export const ButtonGroup = React.forwardRef<HTMLDivElement, { 
  className?: string;
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  vertical?: boolean;
}>(({ className, children, spacing: groupSpacing = 'sm', vertical = false, ...props }, ref) => {
  const spacingClasses = {
    none: '',
    sm: vertical ? 'space-y-1' : 'space-x-1',
    md: vertical ? 'space-y-2' : 'space-x-2',
    lg: vertical ? 'space-y-3' : 'space-x-3',
  };

  const classes = cn(
    'flex',
    vertical ? 'flex-col' : 'flex-row',
    spacingClasses[groupSpacing],
    className
  );

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

// Компонент для иконок кнопок
export const IconButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'children' | 'iconPosition'>>(
  ({ className, variant = 'primary', size = 'md', disabled = false, loading = false, onClick, type = 'button', fullWidth = false, rounded = 'md', icon, ...props }, ref
) => {
  const baseClasses = cn(
      // Базовые классы
      'inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out',
      
      // Размер кнопки
      buttonSizes[size].padding,
      buttonSizes[size].fontSize,
      buttonSizes[size].minHeight,
      
      // Скругление углов
      buttonRounded[rounded],
      
      // Ширина
      fullWidth ? 'w-full' : '',
      
      // Состояния
      disabled ? buttonVariants[variant].disabled : buttonVariants[variant].default,
      
      // Фокус
      'focus:outline-none',
      
      // Курсор
      disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      
      className
    );

  const loadingClasses = cn(
    'animate-spin h-4 w-4'
  );

  return (
    <button
      ref={ref}
      type={type}
      className={baseClasses}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className={loadingClasses} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 018 0 018 8 0 01-1 1-1 1 0-.393.393-1.415-1.415L8.586 10.414a2 2 0 002.828 0 01-1.414-1.414L10.414 8.586A2 2 0 001-1.414-1.414 01-1.414-1.414 01-.393.393-1.415-1.415L15.586 13.586A2 2 0 0014.172 0 01.414 1.414 01.414 1.414 01.393.393 1.415-1.415z"></path>
        </svg>
      ) : (
        icon
      )}
    </button>
  );
});

IconButton.displayName = 'IconButton';
