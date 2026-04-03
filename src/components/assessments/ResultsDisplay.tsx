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
  BarChart3,
} from 'lucide-react';
import { QuestionDisplay } from './QuestionDisplay';

interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
  userAnswer?: number | number[];
  isCorrect?: boolean;
}

interface ResultsDisplayProps {
  results: {
    score: number;
    passed: boolean;
    totalPoints: number;
    earnedPoints: number;
    passingScore: number;
    timeSpent: number;
    totalTime: number;
    questions: Question[];
  };
  badge?: {
    name: string;
    description: string;
    image: string;
  };
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
  const [selectedQuestion, setSelectedQuestion] = React.useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const correctAnswers = results.questions.filter(q => q.isCorrect).length;
  const incorrectAnswers = results.questions.filter(q => q.isCorrect === false).length;
  const unattempted = results.questions.filter(q => q.userAnswer === undefined).length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (results.passed) {
      if (results.score >= 90) return 'Excellent! You\'re a master!';
      if (results.score >= 80) return 'Great job! You\'ve done well!';
      return 'Good job! You passed!';
    }
    return 'Keep practicing! You\'ll get it next time.';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Assessment Results</h1>
        <p className="text-charcoal-600">{getScoreMessage()}</p>
      </div>

      {/* Score Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Circle */}
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
                  className="text-charcoal-200"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 72}
                  strokeDashoffset={2 * Math.PI * 72 * (1 - results.score / 100)}
                  className={results.passed ? 'text-green-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}%
                </span>
                <span className="text-xs text-charcoal-500">Final Score</span>
              </div>
            </div>
            <Badge variant={results.passed ? 'success' : 'error'} className="mt-2">
              {results.passed ? 'PASSED' : 'NOT PASSED'}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-charcoal-500">Correct</p>
              <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
            </div>
            <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
              <p className="text-xs text-charcoal-500">Incorrect</p>
              <p className="text-xl font-bold text-red-600">{incorrectAnswers}</p>
            </div>
            <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-charcoal-500">Time Taken</p>
              <p className="text-xl font-bold text-blue-600">{formatTime(results.timeSpent)}</p>
            </div>
            <div className="text-center p-3 bg-charcoal-100/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-charcoal-500">Accuracy</p>
              <p className="text-xl font-bold text-purple-600">
                {Math.round((correctAnswers / results.questions.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Badge Earned */}
      {badge && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Badge Earned!</h3>
              <p className="text-xl font-bold text-yellow-700 mb-1">{badge.name}</p>
              <p className="text-sm text-charcoal-600">{badge.description}</p>
            </div>
            <Button variant="outline" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </Card>
      )}

      {/* Performance Analytics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div>
            <h4 className="text-sm font-medium text-charcoal-500 mb-3">Score Distribution</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Correct Answers</span>
                  <span className="font-medium">{correctAnswers}</span>
                </div>
                <Progress value={(correctAnswers / results.questions.length) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Incorrect Answers</span>
                  <span className="font-medium">{incorrectAnswers}</span>
                </div>
                <Progress 
                  value={(incorrectAnswers / results.questions.length) * 100} 
                  indicatorClassName="bg-red-500"
                />
              </div>
              {unattempted > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Not Attempted</span>
                    <span className="font-medium">{unattempted}</span>
                  </div>
                  <Progress 
                    value={(unattempted / results.questions.length) * 100}
                    indicatorClassName="bg-charcoal-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Time Analysis */}
          <div>
            <h4 className="text-sm font-medium text-charcoal-500 mb-3">Time Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time Taken</span>
                <span className="font-medium">{formatTime(results.timeSpent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Time</span>
                <span className="font-medium">{formatTime(results.totalTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Time Remaining</span>
                <span className="font-medium">{formatTime(results.totalTime - results.timeSpent)}</span>
              </div>
              <div className="w-full bg-charcoal-100 h-2 rounded-full mt-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(results.timeSpent / results.totalTime) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Question Review */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Question Review</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedQuestion(null)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Summary
            </Button>
          </div>
        </div>

        {selectedQuestion !== null ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedQuestion(null)}
              className="mb-2"
            >
              ← Back to Summary
            </Button>
            <QuestionDisplay
              question={results.questions[selectedQuestion]}
              index={selectedQuestion}
              totalQuestions={results.questions.length}
              selectedAnswer={results.questions[selectedQuestion].userAnswer}
              showExplanation={true}
              readOnly={true}
              isCorrect={results.questions[selectedQuestion].isCorrect} onAnswer={function (_answer: number | number[]): void {
                throw new Error('Function not implemented.');
              } }            />
          </div>
        ) : (
          <div className="space-y-3">
            {results.questions.map((q, index) => (
              <button
                key={index}
                onClick={() => onReviewQuestion?.(index) || setSelectedQuestion(index)}
                className="w-full text-left p-3 border rounded-lg hover:bg-charcoal-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {q.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  ) : q.userAnswer === undefined ? (
                    <div className="h-5 w-5 rounded-full border-2 border-charcoal-300 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-charcoal-500">
                        Points: {q.isCorrect ? q.points : 0}/{q.points}
                      </span>
                      {q.explanation && (
                        <span className="text-xs text-primary-600">View Explanation →</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
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