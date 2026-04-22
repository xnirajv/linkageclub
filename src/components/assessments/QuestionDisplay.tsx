'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/forms/RadioGroup';
import { Checkbox } from '@/components/forms/Checkbox';
import { Label } from '../ui/lable';

interface Question {
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
  const handleSingleSelect = (value: string) => {
    if (!readOnly) onAnswer(parseInt(value));
  };

  const getOptionLetter = (idx: number) => String.fromCharCode(65 + idx);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">
            Question {index + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {question.points} {question.points === 1 ? 'point' : 'points'}
          </span>
        </div>
        {onMarkForReview && (
          <Button variant="ghost" size="sm" onClick={onMarkForReview} className={isMarked ? 'text-yellow-600' : ''}>
            <AlertCircle className="h-4 w-4 mr-2" />
            {isMarked ? 'Marked for Review' : 'Mark for Review'}
          </Button>
        )}
      </div>

      <h3 className="text-lg font-medium mb-6">{question.question}</h3>

      <RadioGroup
        value={selectedAnswer?.toString()}
        onValueChange={handleSingleSelect}
        disabled={readOnly}
        className="space-y-3"
      >
        {question.options.map((option, optIdx) => (
          <div key={optIdx} className="flex items-start space-x-3">
            <RadioGroupItem value={optIdx.toString()} id={`q${index}-opt${optIdx}`} disabled={readOnly} />
            <Label htmlFor={`q${index}-opt${optIdx}`} className="text-sm leading-relaxed cursor-pointer">
              <span className="font-medium mr-2">{getOptionLetter(optIdx)}.</span>
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {showExplanation && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Explanation</h4>
          <p className="text-sm text-blue-700">{question.explanation}</p>
        </div>
      )}

      {readOnly && isCorrect !== undefined && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          {isCorrect ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Correct</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Incorrect</span>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
