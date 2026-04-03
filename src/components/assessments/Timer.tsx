'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp?: () => void;
  onTick?: (timeLeft: number) => void;
  autoSubmit?: boolean;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  warningThreshold?: number; // seconds
  dangerThreshold?: number; // seconds
  className?: string;
}

export function Timer({
  duration,
  onTimeUp,
  onTick,
  autoSubmit = true,
  showProgress = true,
  size = 'md',
  warningThreshold = 300, // 5 minutes
  dangerThreshold = 60, // 1 minute
  className,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const [hasWarned, setHasWarned] = useState(false);
  const [hasDanger, setHasDanger] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
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

  useEffect(() => {
    // Warning threshold
    if (!hasWarned && timeLeft <= warningThreshold && timeLeft > dangerThreshold) {
      setHasWarned(true);
      // You could trigger a toast or sound here
    }

    // Danger threshold
    if (!hasDanger && timeLeft <= dangerThreshold && timeLeft > 0) {
      setHasDanger(true);
      // You could trigger a more urgent warning here
    }
  }, [timeLeft, warningThreshold, dangerThreshold, hasWarned, hasDanger]);

  const getTimeColor = () => {
    if (timeLeft <= dangerThreshold) return 'text-red-600';
    if (timeLeft <= warningThreshold) return 'text-yellow-600';
    return 'text-charcoal-950';
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
      case 'md':
        return 'text-2xl';
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
        {/* Timer Display */}
        <div className="relative">
          {timeLeft <= warningThreshold && (
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

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full mt-2">
            <Progress
              value={progress}
              className="h-2"
              indicatorClassName={getProgressColor()}
            />
          </div>
        )}

        {/* Status Messages */}
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

// Compact Timer variant
interface CompactTimerProps {
  duration: number;
  className?: string;
}

export function CompactTimer({ duration, className }: CompactTimerProps) {
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (timeLeft < 60) return 'text-red-600';
    if (timeLeft < 300) return 'text-yellow-600';
    return 'text-charcoal-600';
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

// Countdown Timer (for session start)
interface CountdownTimerProps {
  targetTime: Date;
  onComplete?: () => void;
}

export function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      return Math.max(0, Math.floor((target - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onComplete]);

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (timeLeft === 0) {
    return <span className="text-green-600 font-medium">Ready to start!</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-primary-600" />
      <span className="font-mono font-medium">{formatCountdown(timeLeft)}</span>
    </div>
  );
}