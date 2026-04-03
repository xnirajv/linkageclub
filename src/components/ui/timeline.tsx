import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: 'completed' | 'current' | 'upcoming' | 'failed';
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'alternate' | 'compact';
  className?: string;
}

const Timeline = ({ items, variant = 'default', className }: TimelineProps) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'current':
        return <Clock className="h-5 w-5 text-primary-500" />;
      case 'failed':
        return <Circle className="h-5 w-5 text-error-500" />;
      default:
        return <Circle className="h-5 w-5 text-charcoal-300" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'border-success-500';
      case 'current':
        return 'border-primary-500';
      case 'failed':
        return 'border-error-500';
      default:
        return 'border-charcoal-200';
    }
  };

  if (variant === 'alternate') {
    return (
      <div className={cn('space-y-8', className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="flex-1 text-right">
              {index % 2 === 0 && (
                <>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-charcoal-600">{item.description}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-charcoal-500 mt-1">{item.date}</p>
                  )}
                </>
              )}
            </div>
            
            <div className="relative flex flex-col items-center">
              <div className="z-10">
                {item.icon || getStatusIcon(item.status)}
              </div>
              {index < items.length - 1 && (
                <div className={cn(
                  'absolute top-5 h-16 w-0.5',
                  getStatusColor(item.status)
                )} />
              )}
            </div>
            
            <div className="flex-1">
              {index % 2 === 1 && (
                <>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-charcoal-600">{item.description}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-charcoal-500 mt-1">{item.date}</p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5">
              {item.icon || getStatusIcon(item.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{item.title}</h4>
                {item.date && (
                  <span className="text-xs text-charcoal-500">{item.date}</span>
                )}
              </div>
              {item.description && (
                <p className="text-sm text-charcoal-600">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default vertical timeline
  return (
    <div className={cn('space-y-6', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className="z-10">
              {item.icon || getStatusIcon(item.status)}
            </div>
            {index < items.length - 1 && (
              <div className={cn(
                'absolute top-5 h-16 w-0.5',
                getStatusColor(item.status)
              )} />
            )}
          </div>
          
          <div className="flex-1 pb-6">
            <h3 className="font-semibold">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-charcoal-600 mt-1">{item.description}</p>
            )}
            {item.date && (
              <p className="text-xs text-charcoal-500 mt-2">{item.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export { Timeline };
export type { TimelineItem };