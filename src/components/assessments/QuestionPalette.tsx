'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: (number | number[] | undefined)[];
  markedForReview: number[];
  onQuestionSelect: (index: number) => void;
  timeLeft?: number;
}

export function QuestionPalette({
  totalQuestions,
  currentQuestion,
  answers,
  markedForReview,
  onQuestionSelect,
  timeLeft,
}: QuestionPaletteProps) {
  const getQuestionStatus = (index: number) => {
    const answer = answers[index];
    const hasAnswer = answer !== undefined && 
      (Array.isArray(answer) ? answer.length > 0 : answer !== -1);
    const isMarked = markedForReview.includes(index);

    if (hasAnswer && isMarked) return 'answered-marked';
    if (hasAnswer) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'marked':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'answered-marked':
        return 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds || seconds < 0) return '--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimeColor = (seconds?: number) => {
    if (!seconds) return 'text-gray-600';
    if (seconds < 300) return 'text-red-600';
    if (seconds < 600) return 'text-yellow-600';
    return 'text-gray-600 dark:text-gray-400';
  };

  const answeredCount = answers.filter((a) => {
    return a !== undefined && (Array.isArray(a) ? a.length > 0 : a !== -1);
  }).length;

  return (
    <Card className="p-4 sticky top-24">
      {/* Timer */}
      {timeLeft !== undefined && (
        <div className="mb-4 p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Time Remaining
          </p>
          <p
            className={`text-xl font-mono font-bold ${getTimeColor(timeLeft)}`}
          >
            {formatTime(timeLeft)}
          </p>
        </div>
      )}

      {/* Question Grid */}
      <div>
        <h3 className="font-medium mb-3 text-sm">Question Palette</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const status = getQuestionStatus(index);
            return (
              <button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={cn(
                  'w-8 h-8 rounded-md text-sm font-medium transition-all border',
                  getStatusColor(status),
                  currentQuestion === index &&
                    'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 scale-110'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Answered & Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded" />
          <span className="text-gray-600 dark:text-gray-400">Not Visited</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-t dark:border-gray-700 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Total:</span>
          <span className="font-medium">{totalQuestions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Answered:</span>
          <span className="font-medium text-green-600">{answeredCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Marked:</span>
          <span className="font-medium text-yellow-600">
            {markedForReview.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Remaining:</span>
          <span className="font-medium text-gray-600">
            {totalQuestions - answeredCount}
          </span>
        </div>
      </div>
    </Card>
  );
}