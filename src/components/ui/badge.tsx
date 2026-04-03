import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.02em] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-500 text-white shadow-[0_10px_24px_-16px_rgba(99,102,241,0.7)]',
        secondary: 'border-transparent bg-secondary-500 text-white shadow-[0_10px_24px_-16px_rgba(139,92,246,0.55)]',
        destructive: 'border-transparent bg-rose-500 text-white',
        success: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
        verified: 'border-transparent bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
        pending: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        warning: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        error: 'border-transparent bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        info: 'border-transparent bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
        skill: 'border-transparent bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
        outline: 'border-white/60 bg-card/70 text-foreground dark:border-white/10 dark:bg-charcoal-900/60',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
