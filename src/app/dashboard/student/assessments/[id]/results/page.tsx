'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface ResultsData {
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  passingScore: number;
  timeSpent: number;
  questions: QuestionReview[];
}

interface BadgeData {
  name: string;
  description: string;
  image?: string;
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params?.id as string;
  const { getResults } = useAssessment(assessmentId);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getResults();
        console.log('API Response:', data);

        if (data && data.results) {
          setResults(data.results);
          setBadge(data.badge || null);
        }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">No results found. Please complete the assessment first.</p>
          <Button className="mt-4" onClick={() => router.push(`/dashboard/student/assessments/${assessmentId}`)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

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
            <h1 className="text-2xl font-bold">Congratulations! You Passed!</h1>
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
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
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
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                {results.score}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Passing Score</p>
              <p className="text-lg font-semibold">{results.passingScore || 70}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Taken</p>
              <p className="text-lg font-semibold">{formatTime(results.timeSpent || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Points Earned</p>
              <p className="text-lg font-semibold">{results.earnedPoints || 0}/{results.totalPoints || 0}</p>
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
            <div>
              <h3 className="font-semibold text-lg">Badge Earned!</h3>
              <p className="text-gray-600">{badge.name}</p>
              <p className="text-sm text-gray-500 mt-1">{badge.description}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Question Review */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Question Review</h2>
        <div className="space-y-4">
          {results.questions && results.questions.map((q: QuestionReview, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
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
                      {q.userAnswer !== undefined && q.userAnswer !== -1
                        ? (q.options && q.options[q.userAnswer])
                          ? q.options[q.userAnswer]
                          : `Option ${q.userAnswer + 1}`
                        : 'Not answered'}
                    </p>
                    {!q.isCorrect && (
                      <p className="mt-1">
                        <span className="font-medium">Correct answer:</span>{' '}
                        {q.options && q.options[q.correctAnswer]
                          ? q.options[q.correctAnswer]
                          : `Option ${q.correctAnswer + 1}`}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="mt-2 text-gray-600">{q.explanation}</p>
                    )}
                  </div>
                </div>
                <Badge variant={q.isCorrect ? 'default' : 'destructive'}>
                  {q.points} pts
                </Badge>
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
          Share Result
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