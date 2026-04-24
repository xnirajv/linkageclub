'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TimerProps {
  duration: number;
  onTimeUp?: () => void;
  onTick?: (timeLeft: number) => void;
  autoSubmit?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  warningThreshold?: number;
  dangerThreshold?: number;
  className?: string;
}

export function Timer({
  duration,
  onTimeUp,
  onTick,
  autoSubmit = true,
  showProgress = true,
  size = 'md',
  warningThreshold = 300,
  dangerThreshold = 60,
  className,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          if (autoSubmit && onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        const newTime = prev - 1;
        onTick?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, autoSubmit, onTimeUp, onTick]);

  const getTimeColor = () => {
    if (timeLeft <= dangerThreshold) return 'text-red-600 dark:text-red-400';
    if (timeLeft <= warningThreshold) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-900 dark:text-white';
  };

  const getProgressColor = () => {
    if (timeLeft <= dangerThreshold) return 'bg-red-600';
    if (timeLeft <= warningThreshold) return 'bg-yellow-600';
    return 'bg-primary-600';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-lg';
      case 'lg':
        return 'text-4xl';
      default:
        return 'text-2xl';
    }
  };

  const progress = (timeLeft / duration) * 100;

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex flex-col items-center">
        <div className="relative">
          {timeLeft <= warningThreshold && timeLeft > 0 && (
            <AlertCircle
              className={cn(
                'absolute -left-6 top-1/2 transform -translate-y-1/2 h-4 w-4',
                timeLeft <= dangerThreshold ? 'text-red-500' : 'text-yellow-500'
              )}
            />
          )}
          <span
            className={cn(
              'font-mono font-bold',
              getSizeClasses(),
              getTimeColor()
            )}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {showProgress && (
          <div className="w-full mt-2">
            <Progress
              value={progress}
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
          </div>
        )}

        {timeLeft <= dangerThreshold && timeLeft > 0 && (
          <p className="text-xs text-red-600 mt-2 animate-pulse">
            Time is almost up! Submit quickly.
          </p>
        )}

        {timeLeft === 0 && (
          <p className="text-sm text-red-600 mt-2 font-medium">
            Time's up!
          </p>
        )}
      </div>
    </Card>
  );
}

export function CompactTimer({
  duration,
  className,
}: {
  duration: number;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCompact = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getColor = () => {
    if (timeLeft < 60) return 'text-red-600';
    if (timeLeft < 300) return 'text-yellow-600';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Clock className={cn('h-4 w-4', getColor())} />
      <span className={cn('font-mono text-sm font-medium', getColor())}>
        {formatCompact(timeLeft)}
      </span>
    </div>
  );
}