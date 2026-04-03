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
  onSubmit?: () => void;
  timeLeft?: number;
}

export function QuestionPalette({
  totalQuestions,
  currentQuestion,
  answers,
  markedForReview,
  onQuestionSelect,
  onSubmit,
  timeLeft,
}: QuestionPaletteProps) {
  const getQuestionStatus = (index: number) => {
    const hasAnswer = answers[index] !== undefined && 
      (Array.isArray(answers[index]) 
        ? (answers[index] as number[]).length > 0
        : true);
    const isMarked = markedForReview.includes(index);

    if (hasAnswer && isMarked) return 'answered-marked';
    if (hasAnswer) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      case 'marked':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200';
      case 'answered-marked':
        return 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200';
      default:
        return 'bg-charcoal-100 text-charcoal-700 border-charcoal-300 hover:bg-charcoal-100';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds?: number) => {
    if (!seconds) return 'text-charcoal-600';
    if (seconds < 300) return 'text-red-600'; // Less than 5 minutes
    if (seconds < 600) return 'text-yellow-600'; // Less than 10 minutes
    return 'text-charcoal-600';
  };

  return (
    <Card className="p-4 sticky top-4">
      {/* Timer */}
      {timeLeft !== undefined && (
        <div className="mb-4 p-3 bg-charcoal-100/50 rounded-lg text-center">
          <p className="text-xs text-charcoal-500 mb-1">Time Remaining</p>
          <p className={`text-xl font-mono font-bold ${getTimeColor(timeLeft)}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
      )}

      {/* Question Grid */}
      <div>
        <h3 className="font-medium mb-3">Question Palette</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const status = getQuestionStatus(index);
            return (
              <button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={cn(
                  'w-8 h-8 rounded-md text-sm font-medium transition-colors border',
                  getStatusColor(status),
                  currentQuestion === index && 'ring-2 ring-primary-500 ring-offset-2'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span className="text-charcoal-600">Answered</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
          <span className="text-charcoal-600">Marked for Review</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
          <span className="text-charcoal-600">Answered & Marked</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-charcoal-100 border border-charcoal-300 rounded" />
          <span className="text-charcoal-600">Not Visited</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Total Questions:</span>
          <span className="font-medium">{totalQuestions}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Answered:</span>
          <span className="font-medium text-green-600">
            {answers.filter((a) => {
              const hasAnswer = a !== undefined && 
                (Array.isArray(a) ? a.length > 0 : true);
              return hasAnswer;
            }).length}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Marked for Review:</span>
          <span className="font-medium text-yellow-600">{markedForReview.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-500">Remaining:</span>
          <span className="font-medium text-charcoal-600">
            {totalQuestions - answers.filter(a => a !== undefined).length}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      {onSubmit && (
        <Button
          onClick={onSubmit}
          className="w-full mt-4"
          variant="default"
        >
          Submit Assessment
        </Button>
      )}
    </Card>
  );
}