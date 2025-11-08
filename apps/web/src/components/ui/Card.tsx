'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/design/utils';
import { fadeInUp, cardHover } from '../animations/variants';

// Card variants using class-variance-authority
const cardVariants = cva(
  // Base styles
  'rounded-2xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-slate-800/50 border border-white/10 text-white',
        glass: 'backdrop-blur-xl bg-white/10 border border-white/20',
        gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-white/20',
        neon: 'bg-gradient-to-br from-neon-cyan/5 to-neon-lime/5 border border-neon-cyan/30',
        elevated: 'bg-slate-800 shadow-xl shadow-black/20 border border-white/10',
        interactive: 'bg-slate-800/50 border border-white/10 cursor-pointer hover:border-white/20',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-2 hover:shadow-2xl',
        glow: 'hover:shadow-glow hover:shadow-primary-500/30',
        scale: 'hover:scale-105',
        rotate: 'hover:rotate-1',
        tilt: 'hover:perspective-1000 hover:[transform:rotateX(5deg)_rotateY(5deg)]',
        neon: 'hover:shadow-[0_0_30px_rgba(0,245,255,0.6)]',
      },
      glow: {
        none: '',
        small: 'shadow-glow-sm',
        medium: 'shadow-glow',
        large: 'shadow-glow-lg',
        purple: 'shadow-glow-purple',
        neon: 'shadow-[0_0_20px_rgba(0,245,255,0.5)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
      glow: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  animated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

// 3D Tilt effect
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [tilt, setTilt] = React.useState({ rotateX: 0, rotateY: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      hover,
      glow,
      animated = true,
      clickable = false,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const CardWrapper = hover === 'tilt' || clickable ? TiltCard : motion.div;

    const cardContent = (
      <div
        className={cn(cardVariants({ variant, padding, hover, glow }), className)}
        ref={ref}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );

    if (animated && !clickable) {
      return (
        <motion.div
          initial={animated ? 'hidden' : false}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          {cardContent}
        </motion.div>
      );
    }

    if (clickable || hover !== 'none') {
      return (
        <CardWrapper className={cardVariants({ variant, padding, hover, glow })}>
          <motion.div
            whileHover="hover"
            variants={cardHover}
            className={clickable ? 'cursor-pointer' : ''}
            onClick={onClick}
          >
            {children}
          </motion.div>
        </CardWrapper>
      );
    }

    return cardContent;
  }
);

Card.displayName = 'Card';

// Card sub-components
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight text-white', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Convenience components for different card types
export const GlassCard = (props: Omit<CardProps, 'variant'>) => (
  <Card variant="glass" {...props} />
);

export const GradientCard = (props: Omit<CardProps, 'variant'>) => (
  <Card variant="gradient" {...props} />
);

export const NeonCard = (props: Omit<CardProps, 'variant'>) => (
  <Card variant="neon" {...props} />
);

export const ElevatedCard = (props: Omit<CardProps, 'variant'>) => (
  <Card variant="elevated" {...props} />
);

export const InteractiveCard = (props: Omit<CardProps, 'variant' | 'clickable'>) => (
  <Card variant="interactive" clickable {...props} />
);

export default Card;
