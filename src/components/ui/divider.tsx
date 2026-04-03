import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
  withText?: boolean;
  textPosition?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

const Divider = ({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  withText = false,
  textPosition = 'center',
  children,
  className,
  ...props
}: DividerProps) => {
  const thicknessClasses = {
    thin: orientation === 'horizontal' ? 'h-px' : 'w-px',
    medium: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
    thick: orientation === 'horizontal' ? 'h-1' : 'w-1',
  };

  const variantClasses = {
    solid: 'bg-charcoal-100',
    dashed: 'bg-transparent border-t-2 border-dashed border-charcoal-200',
    dotted: 'bg-transparent border-t-2 border-dotted border-charcoal-200',
  };

  if (withText && children) {
    return (
      <div className="relative flex items-center">
        <div
          className={cn(
            'flex-grow',
            variantClasses[variant],
            thicknessClasses[thickness]
          )}
        />
        <span className="mx-4 flex-shrink text-sm text-charcoal-500">{children}</span>
        <div
          className={cn(
            'flex-grow',
            variantClasses[variant],
            thicknessClasses[thickness]
          )}
        />
      </div>
    );
  }

  return (
    <hr
      className={cn(
        orientation === 'vertical' ? 'h-full' : 'w-full',
        variantClasses[variant],
        thicknessClasses[thickness],
        className
      )}
      {...props}
    />
  );
};

const Separator = Divider;

export { Divider, Separator };
