import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  noPadding?: boolean;
  as?: React.ElementType;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[90rem]',
  full: 'max-w-full',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', noPadding = false, as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'mx-auto w-full',
          sizeClasses[size],
          !noPadding && 'px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = 'Container';

// Page Container with consistent padding
export const PageContainer = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Container
        ref={ref}
        className={cn('py-6 md:py-8 lg:py-10', className)}
        {...props}
      >
        {children}
      </Container>
    );
  }
);

PageContainer.displayName = 'PageContainer';

// Section Container for page sections
export const SectionContainer = React.forwardRef<
  HTMLDivElement,
  ContainerProps & { background?: 'white' | 'gray' | 'primary' | 'none' }
>(({ className, background = 'none', children, ...props }, ref) => {
  const backgroundClasses = {
    white: 'bg-card dark:bg-charcoal-900',
    gray: 'bg-charcoal-100/50 dark:bg-charcoal-800',
    primary: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white',
    none: '',
  };

  return (
    <section className={backgroundClasses[background]}>
      <Container ref={ref} className={cn('py-12 md:py-16 lg:py-20', className)} {...props}>
        {children}
      </Container>
    </section>
  );
});

SectionContainer.displayName = 'SectionContainer';