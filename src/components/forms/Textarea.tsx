import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'interactive-ring flex min-h-[120px] w-full rounded-[24px] border border-white/55 bg-card/72 px-4 py-3 text-sm text-charcoal-900 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.24)] placeholder:text-charcoal-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-charcoal-900/72 dark:text-white dark:placeholder:text-charcoal-500',
        error && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export { Textarea };
