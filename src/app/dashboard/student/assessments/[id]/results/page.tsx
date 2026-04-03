'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/layout'; // ✅ Fix: Use correct DashboardLayout import
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award, Share2, Download } from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';

interface QuestionReview {
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
  points: number;
}

interface Results {
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  passingScore: number;
  timeSpent: number;
  questions: QuestionReview[];
}

interface Badge {
  name: string;
  description: string;
  image?: string;
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params?.id as string;
  const { getResults } = useAssessment(assessmentId);
  const [results, setResults] = useState<{ results: Results; badge?: Badge } | null>(null);
  const [loading, setLoading] = useState(true);

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
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-charcoal-600">Loading results...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { results: resultData, badge } = results;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          {resultData.passed ? (
            <>
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
                Congratulations! You Passed!
              </h1>
              <p className="text-charcoal-600 dark:text-charcoal-400">
                You've successfully completed the assessment
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
                Assessment Completed
              </h1>
              <p className="text-charcoal-600 dark:text-charcoal-400">
                Keep practicing and try again
              </p>
            </>
          )}
        </div>

        {/* Score Card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-sm text-charcoal-500 mb-2">Your Score</p>
              <div className="relative inline-flex">
                <svg className="w-32 h-32" viewBox="0 0 128 128">
                  <circle
                    className="text-charcoal-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className={resultData.passed ? 'text-green-500' : 'text-red-500'}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - resultData.score / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="56"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  {resultData.score}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-charcoal-500">Passing Score</p>
                <p className="text-lg font-semibold">{resultData.passingScore}%</p>
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Time Taken</p>
                <p className="text-lg font-semibold">
                  {Math.floor(resultData.timeSpent / 60)}m {resultData.timeSpent % 60}s
                </p>
              </div>
              <div>
                <p className="text-sm text-charcoal-500">Points Earned</p>
                <p className="text-lg font-semibold">
                  {resultData.earnedPoints}/{resultData.totalPoints}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Badge Earned */}
        {badge && (
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Badge Earned!</h3>
                <p className="text-charcoal-600 dark:text-charcoal-400">{badge.name}</p>
                <p className="text-sm text-charcoal-500 mt-1">{badge.description}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Question Review */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Question Review</h2>
          <div className="space-y-4">
            {resultData.questions.map((q: QuestionReview, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {q.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <div className="mt-2 text-sm">
                      <p>
                        <span className="font-medium">Your answer:</span>{' '}
                        {q.userAnswer !== -1 ? q.options[q.userAnswer] : 'Not answered'}
                      </p>
                      {!q.isCorrect && (
                        <p className="mt-1">
                          <span className="font-medium">Correct answer:</span>{' '}
                          {q.options[q.correctAnswer]}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="mt-2 text-charcoal-600">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={q.isCorrect ? 'success' : 'error'}>
                    {q.points} pts
                  </Badge>
                </div>
              </div>
            ))}
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
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Result
          </Button>
          {resultData.passed && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}