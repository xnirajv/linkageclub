import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Spinner = ({ className, size = 'md', ...props }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-transparent border-t-primary-600 border-r-primary-600',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};

interface LoadingSpinnerProps extends SpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

const Loader = ({ text, fullScreen, ...props }: LoadingSpinnerProps) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner {...props} />
      {text && <p className="text-sm text-charcoal-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export { Spinner, Loader };