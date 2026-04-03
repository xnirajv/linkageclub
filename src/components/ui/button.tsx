import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'interactive-ring inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.01em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-500 via-info-500 to-secondary-500 text-white shadow-[0_22px_50px_-24px_rgba(99,102,241,0.7)] hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-26px_rgba(99,102,241,0.82)]',
        destructive: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-[0_18px_40px_-22px_rgba(239,68,68,0.55)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_rgba(239,68,68,0.65)]',
        outline: 'border border-white/55 bg-card/70 text-charcoal-900 shadow-[0_16px_36px_-28px_rgba(15,23,42,0.25)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-primary-200 hover:bg-card hover:text-primary-700 dark:border-white/10 dark:bg-charcoal-900/65 dark:text-white dark:hover:border-primary-500 dark:hover:bg-charcoal-800',
        secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-[0_18px_40px_-20px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-24px_rgba(139,92,246,0.74)]',
        ghost: 'text-charcoal-700 hover:bg-card/70 hover:text-primary-700 dark:text-charcoal-100 dark:hover:bg-charcoal-900/60 dark:hover:text-primary-300',
        link: 'rounded-none px-0 text-primary-600 underline-offset-4 hover:text-secondary-500 hover:underline dark:text-primary-300',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        xs: 'h-8 px-3 text-xs',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-12 px-7 text-base',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, isLoading = false, disabled, fullWidth = false, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
