'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Clock,
  Share2,
  Download,
  RotateCcw,
} from 'lucide-react';
import { QuestionDisplay } from './QuestionDisplay';

interface ResultsDisplayProps {
  results: {
    score: number;
    passed: boolean;
    totalPoints: number;
    earnedPoints: number;
    passingScore: number;
    timeSpent: number;
    totalTime: number;
    questions: any[];
  };
  badge?: {
    name: string;
    description: string;
    image?: string;
  } | null;
  onRetry?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onReviewQuestion?: (index: number) => void;
}

export function ResultsDisplay({
  results,
  badge,
  onRetry,
  onShare,
  onDownload,
  onReviewQuestion,
}: ResultsDisplayProps) {
  const [selectedQuestion, setSelectedQuestion] = React.useState<
    number | null
  >(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}m ${secs}s`;
  };

  const correctAnswers = results.questions.filter((q) => q.isCorrect).length;
  const incorrectAnswers = results.questions.filter(
    (q) => q.isCorrect === false
  ).length;
  const unattempted = results.questions.filter(
    (q) => q.userAnswer === undefined || q.userAnswer === -1
  ).length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (results.passed) {
      if (results.score >= 90) return "Excellent! You're a master!";
      if (results.score >= 80) return "Great job! You've done well!";
      return 'Good job! You passed!';
    }
    return "Keep practicing! You'll get it next time.";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Assessment Results</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {getScoreMessage()}
        </p>
      </div>

      {/* Score Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 72}
                  strokeDashoffset={
                    2 * Math.PI * 72 * (1 - results.score / 100)
                  }
                  className={
                    results.passed ? 'text-green-500' : 'text-red-500'
                  }
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-3xl font-bold ${getScoreColor(results.score)}`}
                >
                  {results.score}%
                </span>
                <span className="text-xs text-gray-500">Final Score</span>
              </div>
            </div>
            <Badge
              variant={results.passed ? 'success' : 'error'}
              className="mt-2"
            >
              {results.passed ? 'PASSED' : 'NOT PASSED'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Correct</p>
              <p className="text-xl font-bold text-green-600">
                {correctAnswers}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Incorrect</p>
              <p className="text-xl font-bold text-red-600">
                {incorrectAnswers}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Time Taken</p>
              <p className="text-xl font-bold text-blue-600">
                {formatTime(results.timeSpent)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Accuracy</p>
              <p className="text-xl font-bold text-purple-600">
                {Math.round(
                  (correctAnswers / results.questions.length) * 100
                )}
                %
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Badge */}
      {badge && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Badge Earned!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {badge.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {badge.description}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Analytics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Performance Analytics
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Score</span>
              <span className="font-medium">{results.score}%</span>
            </div>
            <Progress
              value={results.score}
              indicatorClassName={
                results.passed ? 'bg-green-500' : 'bg-red-500'
              }
            />
          </div>
          <div className="flex justify-between text-sm">
            <span>Passing Score</span>
            <span className="font-medium">{results.passingScore}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Points Earned</span>
            <span className="font-medium">
              {results.earnedPoints}/{results.totalPoints}
            </span>
          </div>
        </div>
      </Card>

      {/* Question Review */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Question Review</h3>
        <div className="space-y-2">
          {results.questions.map((q, index) => (
            <button
              key={index}
              onClick={() =>
                setSelectedQuestion(
                  selectedQuestion === index ? null : index
                )
              }
              className="w-full text-left p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {q.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : q.userAnswer === undefined || q.userAnswer === -1 ? (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {q.question}
                  </p>
                  <p className="text-xs text-gray-500">
                    Points: {q.isCorrect ? q.points : 0}/{q.points}
                  </p>
                </div>
              </div>

              {selectedQuestion === index && (
                <div className="mt-4">
                  <QuestionDisplay
                    question={q}
                    index={index}
                    totalQuestions={results.questions.length}
                    selectedAnswer={q.userAnswer}
                    onAnswer={() => {}}
                    showExplanation={true}
                    readOnly={true}
                    isCorrect={q.isCorrect}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Assessment
          </Button>
        )}
        {onShare && (
          <Button onClick={onShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        )}
        {onDownload && (
          <Button onClick={onDownload} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Certificate
          </Button>
        )}
      </div>
    </div>
  );
}