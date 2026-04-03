import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circle' | 'text';
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded-md h-4',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-charcoal-100',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

interface SkeletonCardProps {
  rows?: number;
  hasImage?: boolean;
  hasAvatar?: boolean;
  className?: string;
}

const SkeletonCard = ({
  rows = 3,
  hasImage = false,
  hasAvatar = false,
  className,
}: SkeletonCardProps) => {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      {hasImage && <Skeleton className="h-48 w-full mb-4" />}
      
      <div className="flex items-start gap-3">
        {hasAvatar && <Skeleton variant="circle" className="h-10 w-10" />}
        
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
          
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} variant="text" className="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

interface SkeletonTableProps {
  columns?: number;
  rows?: number;
  className?: string;
}

const SkeletonTable = ({ columns = 4, rows = 5, className }: SkeletonTableProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export { Skeleton, SkeletonCard, SkeletonTable };