import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'interactive-ring flex h-12 w-full rounded-2xl border border-white/55 bg-card/72 px-4 py-3 text-sm text-charcoal-900 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.24)] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-charcoal-900/72 dark:text-white dark:placeholder:text-charcoal-500',
              error && 'border-error-500 focus-visible:ring-error-500',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
