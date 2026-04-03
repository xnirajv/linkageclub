import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onChange?: (value: number) => void;
  showValue?: boolean;
  precision?: 0.5 | 1;
  className?: string;
}

const Rating = ({
  value,
  max = 5,
  size = 'md',
  readOnly = true,
  onChange,
  showValue = false,
  precision = 1,
  className,
}: RatingProps) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleMouseMove = (index: number, event: React.MouseEvent) => {
    if (readOnly) return;

    const { left, width } = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - left) / width;
    
    if (precision === 0.5) {
      const newValue = percent <= 0.5 ? index - 0.5 : index;
      setHoverValue(newValue);
    } else {
      setHoverValue(index);
    }
  };

  const handleClick = (index: number, event: React.MouseEvent) => {
    if (readOnly || !onChange) return;

    const { left, width } = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - left) / width;
    
    if (precision === 0.5) {
      const newValue = percent <= 0.5 ? index - 0.5 : index;
      onChange(newValue);
    } else {
      onChange(index);
    }
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => {
          const index = i + 1;
          const filled = displayValue >= index;
          const halfFilled = precision === 0.5 && displayValue >= index - 0.5 && displayValue < index;

          return (
            <div
              key={index}
              className={cn(
                'relative cursor-pointer transition-colors',
                readOnly && 'cursor-default'
              )}
              onMouseMove={(e) => handleMouseMove(index, e)}
              onMouseLeave={() => setHoverValue(null)}
              onClick={(e) => handleClick(index, e)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-all',
                  filled
                    ? 'fill-yellow-400 text-yellow-400'
                    : halfFilled
                    ? 'fill-yellow-400 text-yellow-400 half-filled'
                    : 'text-charcoal-300'
                )}
              />
            </div>
          );
        })}
      </div>
      
      {showValue && (
        <span className="ml-2 text-sm font-medium text-charcoal-700">
          {value.toFixed(1)}/{max}
        </span>
      )}
    </div>
  );
};

interface RatingDisplayProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RatingDisplay = ({ value, count, size = 'md', className }: RatingDisplayProps) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Rating value={value} size={size} readOnly />
      <span className="text-sm text-charcoal-600">
        {value.toFixed(1)} {count && `(${count} reviews)`}
      </span>
    </div>
  );
};

export { Rating, RatingDisplay };