'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';
import { modalBackdrop, modalContent } from '../animations/variants';

// Overlay variants
const overlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
  {
    variants: {
      blur: {
        none: '',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
      },
      background: {
        default: 'bg-black/50',
        dark: 'bg-black/70',
        light: 'bg-white/20',
        primary: 'bg-primary-900/80',
        gradient: 'bg-gradient-to-br from-primary-900/80 to-secondary-900/80',
      },
    },
    defaultVariants: {
      blur: 'md',
      background: 'default',
    },
  }
);

// Modal content variants
const contentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
      },
      variant: {
        default: 'bg-slate-900/95 border-white/10',
        glass: 'backdrop-blur-xl bg-white/10 border-white/20',
        gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-white/20',
        neon: 'bg-gradient-to-br from-neon-cyan/5 to-neon-lime/5 border-neon-cyan/30',
        dark: 'bg-slate-950/95 border-white/5',
      },
      animation: {
        scale: modalContent,
        slideUp: {
          hidden: { opacity: 0, y: 50, scale: 0.9 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.3, ease: 'easeOut' },
          },
          exit: {
            opacity: 0,
            y: 50,
            scale: 0.9,
            transition: { duration: 0.2, ease: 'easeIn' },
          },
        },
        fade: {
          hidden: { opacity: 0, scale: 0.9 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, ease: 'easeOut' },
          },
          exit: {
            opacity: 0,
            scale: 0.9,
            transition: { duration: 0.2, ease: 'easeIn' },
          },
        },
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      animation: 'scale',
    },
  }
);

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: VariantProps<typeof contentVariants>['size'];
  variant?: VariantProps<typeof contentVariants>['variant'];
  blur?: VariantProps<typeof overlayVariants>['blur'];
  background?: VariantProps<typeof overlayVariants>['background'];
  animation?: VariantProps<typeof contentVariants>['animation'];
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  title,
  description,
  size,
  variant,
  blur,
  background,
  animation,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  contentClassName,
}) => {
  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape || !open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={overlayVariants({ blur, background, className: overlayClassName })}
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleOverlayClick}
        >
          <motion.div
            className={cn(
              contentVariants({ size, variant, animation, className: contentClassName }),
              'relative'
            )}
            variants={(animation || modalContent) as any}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {showCloseButton && (
              <motion.button
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                onClick={handleClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>
            )}

            {/* Header */}
            {(title || description) && (
              <div className="mb-6 pr-12">
                {title && (
                  <motion.h2
                    className="text-2xl font-semibold text-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {title}
                  </motion.h2>
                )}
                {description && (
                  <motion.p
                    className="mt-2 text-slate-400"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {description}
                  </motion.p>
                )}
              </div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal sub-components
export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-white', className)}
    {...props}
  />
));
ModalTitle.displayName = 'ModalTitle';

export const ModalDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-400', className)}
    {...props}
  />
));
ModalDescription.displayName = 'ModalDescription';

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('pt-0', className)}
    {...props}
  />
));
ModalContent.displayName = 'ModalContent';

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6', className)}
    {...props}
  />
));
ModalFooter.displayName = 'ModalFooter';

// Hook for easier modal usage
export const useModal = (initialState = false) => {
  const [open, setOpen] = React.useState(initialState);

  const modal = {
    open,
    setOpen,
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
    toggle: () => setOpen(!open),
  };

  return modal;
};

// Confirmation modal component
export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'variant'> {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
  onConfirm: () => void;
  onCancel?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  onOpenChange,
  open,
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const confirmButtonVariant = variant === 'danger' ? 'error' :
                               variant === 'warning' ? 'warning' : 'primary';

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      {...props}
    >
      <ModalFooter>
        <motion.button
          className="px-4 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors"
          onClick={handleCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {cancelText}
        </motion.button>
        <motion.button
          className={cn(
            'px-4 py-2 rounded-xl font-semibold transition-colors',
            {
              'bg-gradient-to-br from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700':
                variant === 'danger',
              'bg-gradient-to-br from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700':
                variant === 'warning',
              'bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:from-primary-600 hover:to-primary-800':
                variant === 'default',
            }
          )}
          onClick={handleConfirm}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {confirmText}
        </motion.button>
      </ModalFooter>
    </Modal>
  );
};

export default Modal;
