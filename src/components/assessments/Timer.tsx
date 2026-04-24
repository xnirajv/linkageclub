'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Timer({ duration, onTimeUp, onTick, size = 'md', warningThreshold = 300, dangerThreshold = 60 }: any) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); setIsRunning(false); onTimeUp?.(); return 0; }
        const newTime = prev - 1;
        onTick?.(newTime);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, onTimeUp, onTick]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (timeLeft <= dangerThreshold) return 'text-red-600';
    if (timeLeft <= warningThreshold) return 'text-yellow-600';
    return 'text-gray-800';
  };

  const getSizeClass = () => {
    switch (size) { case 'sm': return 'text-lg'; case 'md': return 'text-2xl'; case 'lg': return 'text-4xl'; default: return 'text-2xl'; }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center">
        <div className="relative"><Clock className="absolute -left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><span className={cn('font-mono font-bold', getSizeClass(), getColor())}>{formatTime(timeLeft)}</span></div>
        <div className="w-full mt-2"><Progress value={(timeLeft / duration) * 100} className="h-2" /></div>
        {timeLeft <= dangerThreshold && timeLeft > 0 && <p className="text-xs text-red-600 mt-2 animate-pulse">Time is almost up! Submit quickly.</p>}
        {timeLeft === 0 && <p className="text-sm text-red-600 mt-2 font-medium">Time's up!</p>}
      </div>
    </Card>
  );
}

export function CompactTimer({ duration }: { duration: number }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(() => { const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000); return () => clearInterval(timer); }, []);
  const format = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs.toString().padStart(2, '0')}`; };
  return (<div className="flex items-center gap-1"><Clock className="h-4 w-4 text-gray-400" /><span className={`font-mono text-sm ${timeLeft < 60 ? 'text-red-600' : 'text-gray-600'}`}>{format(timeLeft)}</span></div>);
}