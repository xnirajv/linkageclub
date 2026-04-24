'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Checkbox } from '@/components/forms/Checkbox';
import { Label } from '@/components/ui/lable';
import { RadioGroup, RadioGroupItem } from '@/components/forms/RadioGroup';

interface Question {
  _id?: string;
  id?: string;
  question: string;
  options: string[];
  correctAnswer?: number;
  explanation?: string;
  points: number;
}

interface QuestionDisplayProps {
  question: Question;
  index: number;
  totalQuestions: number;
  selectedAnswer?: number | number[];
  onAnswer: (answer: number | number[]) => void;
  onMarkForReview?: () => void;
  isMarked?: boolean;
  showExplanation?: boolean;
  readOnly?: boolean;
  isCorrect?: boolean;
}

export function QuestionDisplay({
  question,
  index,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onMarkForReview,
  isMarked = false,
  showExplanation = false,
  readOnly = false,
  isCorrect,
}: QuestionDisplayProps) {
  const isMultiSelect = question.options.length > 4;
  const selectedArray = Array.isArray(selectedAnswer) ? selectedAnswer : [];

  const handleSingleSelect = (value: string) => {
    if (!readOnly) {
      onAnswer(parseInt(value));
    }
  };

  const handleMultiSelect = (optionIndex: number, checked: boolean) => {
    if (!readOnly) {
      const newSelection = checked
        ? [...selectedArray, optionIndex]
        : selectedArray.filter((i) => i !== optionIndex);
      onAnswer(newSelection);
    }
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <Card className="p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Question {index + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </span>
        </div>
        {onMarkForReview && !readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkForReview}
            className={isMarked ? 'text-yellow-600' : ''}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {isMarked ? 'Marked for Review' : 'Mark for Review'}
          </Button>
        )}
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-950 dark:text-white">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, optIndex) => (
          <div
            key={optIndex}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
              readOnly && selectedAnswer === optIndex
                ? isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200'
                : readOnly && question.correctAnswer === optIndex
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <RadioGroupItem
              value={optIndex.toString()}
              id={`q${index}-opt${optIndex}`}
              disabled={readOnly}
              checked={selectedAnswer === optIndex}
              onClick={() => handleSingleSelect(optIndex.toString())}
            />
            <Label
              htmlFor={`q${index}-opt${optIndex}`}
              className="text-sm leading-relaxed cursor-pointer flex-1"
            >
              <span className="font-medium mr-2">
                {getOptionLetter(optIndex)}.
              </span>
              {option}
            </Label>
            {readOnly && selectedAnswer === optIndex && (
              isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              )
            )}
            {readOnly && question.correctAnswer === optIndex && selectedAnswer !== optIndex && (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            Explanation
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-200">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Correct/Incorrect Indicator */}
      {readOnly && isCorrect !== undefined && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          {isCorrect ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Correct
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                Incorrect
              </span>
            </>
          )}
        </div>
      )}
    </Card>
  );
}