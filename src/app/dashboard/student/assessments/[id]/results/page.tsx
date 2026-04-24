'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuestionDisplay } from '@/components/assessments/QuestionDisplay';
import {
  CheckCircle,
  XCircle,
  Award,
  Clock,
  TrendingUp,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';
import { Loader2 } from 'lucide-react';

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  const { getResults } = useAssessment(assessmentId);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getResults();
        setResults(data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId, getResults]);

  if (loading || !results) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const { results: resultData, badge, assessmentTitle, skillName } = results;
  const correctAnswers = resultData.questions.filter((q: any) => q.isCorrect).length;
  const incorrectAnswers = resultData.questions.filter(
    (q: any) => q.isCorrect === false
  ).length;
  const unattempted = resultData.questions.filter(
    (q: any) => q.userAnswer === -1 || q.userAnswer === undefined
  ).length;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        {resultData.passed ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
              Congratulations! You Passed!
            </h1>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
              Assessment Completed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Keep practicing and try again
            </p>
          </>
        )}
        {assessmentTitle && (
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {assessmentTitle} {skillName && `• ${skillName}`}
          </p>
        )}
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
                  strokeDashoffset={2 * Math.PI * 72 * (1 - resultData.score / 100)}
                  className={resultData.passed ? 'text-green-500' : 'text-red-500'}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(resultData.score)}`}>
                  {resultData.score}%
                </span>
                <span className="text-xs text-gray-500">Final Score</span>
              </div>
            </div>
            <Badge
              variant={resultData.passed ? 'success' : 'error'}
              className="mt-2 text-sm px-3 py-1"
            >
              {resultData.passed ? 'PASSED' : 'NOT PASSED'}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Correct</p>
              <p className="text-xl font-bold text-green-600">{correctAnswers}</p>
            </div>
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Incorrect</p>
              <p className="text-xl font-bold text-red-600">{incorrectAnswers}</p>
            </div>
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-lg font-bold text-blue-600">
                {formatTime(resultData.timeSpent)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Accuracy</p>
              <p className="text-xl font-bold text-purple-600">
                {Math.round((correctAnswers / resultData.questions.length) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-500">Passing Score</p>
            <p className="font-semibold">{resultData.passingScore}%</p>
          </div>
          <div>
            <p className="text-gray-500">Points Earned</p>
            <p className="font-semibold">{resultData.earnedPoints}/{resultData.totalPoints}</p>
          </div>
          <div>
            <p className="text-gray-500">Attempt #{resultData.attemptNumber || 1}</p>
            <p className="font-semibold">{resultData.questions.length} Questions</p>
          </div>
        </div>
      </Card>

      {/* Badge Earned */}
      {badge && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Badge Earned!</h3>
              <p className="text-gray-700 dark:text-gray-300 font-medium">{badge.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{badge.description}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Question Review */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Question Review</h2>
        <div className="space-y-2">
          {resultData.questions.map((q: any, index: number) => {
            const isExpanded = expandedQuestions.has(index);
            
            return (
              <div
                key={index}
                className={`border rounded-lg transition-colors ${
                  q.isCorrect
                    ? 'border-green-200 dark:border-green-800'
                    : q.userAnswer === -1 || q.userAnswer === undefined
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-red-200 dark:border-red-800'
                }`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {q.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    ) : q.userAnswer === -1 || q.userAnswer === undefined ? (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Q{index + 1}: {q.question}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {q.isCorrect ? '+' : ''}{q.isCorrect ? q.points : 0}/{q.points} pts
                        </span>
                        <span className="text-xs text-primary-600">
                          {isExpanded ? 'Hide details' : 'View details'}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                    <QuestionDisplay
                      question={q}
                      index={index}
                      totalQuestions={resultData.questions.length}
                      selectedAnswer={q.userAnswer}
                      onAnswer={() => {}}
                      showExplanation={true}
                      readOnly={true}
                      isCorrect={q.isCorrect}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/student/assessments')}
        >
          Browse More Assessments
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/dashboard/student/assessments/${assessmentId}/take`)
          }
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Retake Assessment
        </Button>
        {resultData.passed && (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Certificate
          </Button>
        )}
      </div>
    </div>
  );
}