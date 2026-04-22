'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Award, Users, TrendingUp, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

interface AssessmentDetailsProps {
  assessment: {
    _id: string;
    title: string;
    description: string;
    skillName: string;
    level: string;
    price: number;
    duration: number;
    passingScore: number;
    questions: any[];
    totalAttempts: number;
    passRate: number;
    averageScore: number;
    badges?: Array<{ name: string; description: string; requiredScore: number }>;
    ratings?: { average: number; count: number };
  };
  userAttempt?: {
    score: number;
    passed: boolean;
    completedAt: string | null;
  };
  onStart?: () => void;
}

export function AssessmentDetails({ assessment, userAttempt, onStart }: AssessmentDetailsProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'advanced': return 'bg-orange-100 text-orange-700';
      case 'expert': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isCompleted = userAttempt?.completedAt !== null && userAttempt?.completedAt !== undefined;
  const isInProgress = userAttempt && !isCompleted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{assessment.title}</h1>
          <Badge className={getLevelColor(assessment.level)}>{assessment.level}</Badge>
        </div>
        <p className="text-gray-600">{assessment.description}</p>
      </div>

      {/* Rating */}
      {assessment.ratings && assessment.ratings.count > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{assessment.ratings.average}</span>
          </div>
          <span className="text-sm text-gray-400">({formatNumber(assessment.ratings.count)} ratings)</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{assessment.duration} min</p>
          <p className="text-sm text-gray-500">Duration</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}</p>
          <p className="text-sm text-gray-500">Price</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{assessment.passingScore}%</p>
          <p className="text-sm text-gray-500">Passing Score</p>
        </Card>
        <Card className="p-4 text-center">
          <BookOpen className="h-5 w-5 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{assessment.questions?.length || 0}</p>
          <p className="text-sm text-gray-500">Questions</p>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Users className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatNumber(assessment.totalAttempts)}</p>
            <p className="text-sm text-gray-500">Total Attempts</p>
          </div>
          <div>
            <TrendingUp className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assessment.passRate}%</p>
            <p className="text-sm text-gray-500">Pass Rate</p>
          </div>
          <div>
            <Award className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assessment.averageScore}%</p>
            <p className="text-sm text-gray-500">Avg. Score</p>
          </div>
        </div>
      </Card>

      {/* Badges */}
      {assessment.badges && assessment.badges.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Earnable Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessment.badges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-sm text-gray-500">Score {badge.requiredScore}%+</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {isCompleted ? (
          <>
            <Button asChild size="lg">
              <Link href={`/dashboard/student/assessments/${assessment._id}/results`}>View Results</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/dashboard/student/assessments/${assessment._id}`}>Retake Assessment</Link>
            </Button>
          </>
        ) : isInProgress ? (
          <Button asChild size="lg">
            <Link href={`/dashboard/student/assessments/${assessment._id}/take`}>Continue Assessment</Link>
          </Button>
        ) : (
          <Button size="lg" onClick={onStart}>
            {assessment.price > 0 ? `Pay ${formatCurrency(assessment.price)} & Start` : 'Start Assessment'}
          </Button>
        )}
        <Button size="lg" variant="outline">View Sample Questions</Button>
      </div>
    </div>
  );
}