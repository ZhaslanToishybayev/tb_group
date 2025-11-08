'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';

// Toast variants
const toastVariants = cva(
  'pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border shadow-lg backdrop-blur-xl',
  {
    variants: {
      variant: {
        default: 'bg-slate-900/95 border-white/10 text-white',
        success: 'bg-gradient-to-br from-success-500/95 to-success-600/95 border-success-400 text-white',
        error: 'bg-gradient-to-br from-error-500/95 to-error-600/95 border-error-400 text-white',
        warning: 'bg-gradient-to-br from-warning-500/95 to-warning-600/95 border-warning-400 text-white',
        info: 'bg-gradient-to-br from-primary-500/95 to-primary-600/95 border-primary-400 text-white',
        glass: 'backdrop-blur-xl bg-white/10 border-white/20 text-white',
      },
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4 text-base',
        lg: 'p-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactElement;
  onClose?: () => void;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  icon,
  action,
  onClose,
  variant,
  size,
  duration = 5000,
  position = 'top-right',
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}
      initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={toastVariants({ variant, size })}
            layout
          >
            <div className="flex items-start">
              {icon && (
                <div className="flex-shrink-0 mr-3">
                  {getIcon()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <p className="font-medium">{title}</p>
                )}
                {description && (
                  <p className={cn('text-sm', title ? 'mt-1' : '', 'opacity-90')}>
                    {description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex items-center gap-2">
                {action}
                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Toast container for multiple toasts
export interface ToastContainerProps {
  children: React.ReactNode;
  position?: ToastProps['position'];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children, position = 'top-right' }) => {
  return (
    <div className={cn('fixed z-50 pointer-events-none', positionClasses[position])}>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
};

// Toast context for easier usage
interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastProps['position'];
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, position = 'top-right' }) => {
  const [toasts, setToasts] = React.useState<Array<{ id: string; props: ToastProps }>>([]);

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toastWithId = {
      id,
      props: {
        ...props,
        onClose: () => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
        },
      },
    };

    setToasts((prev) => [...prev, toastWithId]);
  };

  const contextValue: ToastContextType = { showToast };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer position={position}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast.props} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export default Toast;
