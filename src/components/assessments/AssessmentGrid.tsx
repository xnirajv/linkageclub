'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  DollarSign,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

interface Assessment {
  _id: string;
  id?: string;
  title: string;
  description: string;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price: number;
  duration: number;
  passingScore: number;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  badges?: Array<{ name: string }>;
  ratings?: { average: number; count: number };
  userAttempt?: {
    score: number;
    passed: boolean;
    completedAt?: string | null;
    answers?: number[];
    timeSpent?: number;
  };
}

interface AssessmentGridProps {
  assessments: Assessment[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function AssessmentGrid({ assessments, isLoading, emptyMessage = 'No assessments found' }: AssessmentGridProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'advanced': return 'bg-orange-100 text-orange-700';
      case 'expert': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAssessmentId = (assessment: Assessment) => assessment.id || assessment._id;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-100 rounded w-16"></div>
              <div className="h-6 bg-gray-100 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-100 rounded w-full"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No assessments found</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assessments.map((assessment) => {
        const assessmentId = getAssessmentId(assessment);
        const isAttempted = assessment.userAttempt !== null && assessment.userAttempt !== undefined;
        const hasPassed = assessment.userAttempt?.passed;
        const isIncomplete = isAttempted && !hasPassed && assessment.userAttempt?.completedAt === null;
        const isCompleted = isAttempted && assessment.userAttempt?.completedAt !== null;

        return (
          <Card key={assessmentId} className="p-6 hover:shadow-lg transition-shadow group">
            <div className="space-y-4">
              {/* Header */}
              <Link href={`/dashboard/student/assessments/${assessmentId}`}>
                <div className="cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{assessment.description}</p>
                    </div>
                    {hasPassed && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
                  </div>
                </div>
              </Link>

              {/* Rating */}
              {assessment.ratings && assessment.ratings.count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{assessment.ratings.average}</span>
                  <span className="text-xs text-gray-400">({formatNumber(assessment.ratings.count)} ratings)</span>
                </div>
              )}

              {/* Skill & Level */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{assessment.skillName}</Badge>
                <Badge className={getLevelColor(assessment.level)}>{assessment.level}</Badge>
                {assessment.badges && assessment.badges.length > 0 && (
                  <Award className="h-4 w-4 text-yellow-500" />
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{assessment.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatNumber(assessment.totalAttempts)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{assessment.passRate}% pass</span>
                </div>
              </div>

              {/* User Progress & Button */}
              {isAttempted ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Your Score</span>
                      <span className="font-medium">{assessment.userAttempt?.score}%</span>
                    </div>
                    <Progress value={assessment.userAttempt?.score || 0} />
                    <p className="text-xs text-gray-500 mt-1">
                      {hasPassed ? '✅ Passed' : '❌ Not passed'}
                    </p>
                  </div>
                  {hasPassed ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/student/assessments/${assessmentId}/results`}>View Results</Link>
                    </Button>
                  ) : isIncomplete ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/student/assessments/${assessmentId}/take`}>Continue Assessment</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/student/assessments/${assessmentId}`}>Retake Assessment</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link href={`/dashboard/student/assessments/${assessmentId}`}>View Details</Link>
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}