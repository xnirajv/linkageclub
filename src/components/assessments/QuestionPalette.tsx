'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: (number | undefined)[];
  markedForReview: number[];
  onQuestionSelect: (index: number) => void;
  timeLeft?: number;
  onSubmit?: () => void;
}

export function QuestionPalette({
  totalQuestions,
  currentQuestion,
  answers,
  markedForReview,
  onQuestionSelect,
  timeLeft,
  onSubmit,
}: QuestionPaletteProps) {
  const getStatus = (index: number) => {
    const hasAnswer = answers[index] !== undefined && answers[index] !== -1;
    const isMarked = markedForReview.includes(index);
    if (hasAnswer && isMarked) return 'answered-marked';
    if (hasAnswer) return 'answered';
    if (isMarked) return 'marked';
    return 'unanswered';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      case 'marked': return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200';
      case 'answered-marked': return 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
    }
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 sticky top-4">
      {timeLeft !== undefined && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg text-center">
          <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
          <p className={`text-xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
      )}

      <h3 className="font-medium mb-3">Question Palette</h3>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const status = getStatus(index);
          return (
            <button
              key={index}
              onClick={() => onQuestionSelect(index)}
              className={cn(
                'w-8 h-8 rounded-md text-sm font-medium transition-colors border',
                getStatusClass(status),
                currentQuestion === index && 'ring-2 ring-primary-500 ring-offset-2'
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
          <span>Answered & Marked</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded" />
          <span>Not Visited</span>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Answered:</span>
          <span className="font-medium text-green-600">
            {answers.filter(a => a !== undefined && a !== -1).length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Marked:</span>
          <span className="font-medium text-yellow-600">{markedForReview.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Remaining:</span>
          <span className="font-medium text-gray-600">
            {totalQuestions - answers.filter(a => a !== undefined && a !== -1).length}
          </span>
        </div>
      </div>

      {onSubmit && (
        <Button onClick={onSubmit} className="w-full mt-4">Submit Assessment</Button>
      )}
    </Card>
  );
}