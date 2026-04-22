'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award, Share2, Download, TrendingUp, Clock, Star } from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';

interface QuestionResult {
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
  points: number;
}

interface ResultsData {
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  passingScore: number;
  timeSpent: number;
  totalTime: number;
  trustScoreIncreased: number;
  badgeEarned: string | null;
  questions: QuestionResult[];
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params?.id as string;
  const { getResults } = useAssessment(assessmentId);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const data = await getResults();
      if (data?.results) setResults(data.results);
      setLoading(false);
    };
    if (assessmentId) fetchResults();
  }, [assessmentId, getResults]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No results found. Please complete the assessment first.</p>
        <Button className="mt-4" onClick={() => router.push(`/dashboard/student/assessments/${assessmentId}`)}>
          Go Back
        </Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const correctCount = results.questions.filter(q => q.isCorrect).length;
  const incorrectCount = results.questions.filter(q => !q.isCorrect).length;
  const accuracy = Math.round((correctCount / results.questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        {results.passed ? (
          <>
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">🎉 Congratulations! You Passed!</h1>
            <p className="text-gray-600">You've successfully completed the assessment</p>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Assessment Completed</h1>
            <p className="text-gray-600">Keep practicing and try again</p>
          </>
        )}
      </div>

      {/* Score Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Your Score</p>
            <div className="relative inline-flex">
              <svg className="w-32 h-32" viewBox="0 0 128 128">
                <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                <circle
                  className={results.passed ? 'text-green-500' : 'text-red-500'}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - results.score / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">{results.score}%</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Passing Score</p>
              <p className="text-lg font-semibold">{results.passingScore}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Taken</p>
              <p className="text-lg font-semibold">{formatTime(results.timeSpent)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Points Earned</p>
              <p className="text-lg font-semibold">{results.earnedPoints}/{results.totalPoints}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Score</span>
            <span>{results.score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full ${results.passed ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${results.score}%` }} />
          </div>
        </div>
      </Card>

      {/* Badge Earned */}
      {results.badgeEarned && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">🏆 Badge Earned!</h3>
              <p className="text-xl font-bold text-yellow-700">{results.badgeEarned}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Trust Score Increase */}
      {results.trustScoreIncreased > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Trust Score Increased!</p>
              <p className="text-sm text-green-700">You earned +{results.trustScoreIncreased} points to your Trust Score</p>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Stats */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Stats</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-xs text-gray-500">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
            <p className="text-xs text-gray-500">Incorrect</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
            <p className="text-xs text-gray-500">Accuracy</p>
          </div>
        </div>
      </Card>

      {/* Detailed Review */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Detailed Review</h2>
        <div className="space-y-4">
          {results.questions.map((q, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-3">
                {q.isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="font-medium">{q.question}</p>
                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Your answer:</span> {q.userAnswer !== -1 ? q.options[q.userAnswer] : 'Not answered'}</p>
                    {!q.isCorrect && <p className="mt-1"><span className="font-medium">Correct answer:</span> {q.options[q.correctAnswer]}</p>}
                    {q.explanation && <p className="mt-2 text-gray-600">{q.explanation}</p>}
                  </div>
                </div>
                <Badge variant={q.isCorrect ? 'default' : 'destructive'}>{q.points} pts</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button variant="outline" onClick={() => router.push('/dashboard/student/assessments')}>
          Browse More Assessments
        </Button>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share on LinkedIn
        </Button>
        {results.passed && (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Certificate
          </Button>
        )}
      </div>
    </div>
  );
}