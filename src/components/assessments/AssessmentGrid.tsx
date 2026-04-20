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
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

interface Assessment {
  _id: string;
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
  userAttempt?: {
    score: number;
    passed: boolean;
  };
}

interface AssessmentGridProps {
  assessments: Assessment[];
  isLoading?: boolean;
  emptyMessage?: string;
  showUserStats?: boolean;
  onQuickStart?: (id: string) => void;
}

export function AssessmentGrid({
  assessments,
  isLoading,
  emptyMessage = 'No assessments found',
  onQuickStart
}: AssessmentGridProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-orange-100 text-orange-700';
      case 'expert':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-charcoal-100 text-charcoal-700';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-charcoal-100 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-charcoal-100 rounded w-full mb-2"></div>
            <div className="h-3 bg-charcoal-100 rounded w-2/3 mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-charcoal-100 rounded w-16"></div>
              <div className="h-6 bg-charcoal-100 rounded w-16"></div>
            </div>
            <div className="h-8 bg-charcoal-100 rounded w-full"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Award className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No assessments found</h3>
        <p className="text-charcoal-500">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assessments.map((assessment) => (
        <Card key={assessment._id} className="p-6 hover:shadow-lg transition-shadow group">
          <Link href={`/dashboard/student/assessments/${assessment._id}`}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 line-clamp-2">{assessment.description}</p>
                </div>
                {assessment.userAttempt?.passed && (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                )}
              </div>

              {/* Skill & Level */}
              <div className="flex items-center gap-2">
                <Badge variant="skill">{assessment.skillName}</Badge>
                <Badge className={getLevelColor(assessment.level)}>
                  {assessment.level}
                </Badge>
                {assessment.badges && assessment.badges.length > 0 && (
                  <Award className="h-4 w-4 text-yellow-500" />
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-charcoal-400" />
                  <span className="text-sm text-charcoal-600">{assessment.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-charcoal-400" />
                  <span className="text-sm text-charcoal-600">
                    {assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-charcoal-400" />
                  <span className="text-sm text-charcoal-600">{formatNumber(assessment.totalAttempts)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-charcoal-400" />
                  <span className="text-sm text-charcoal-600">{assessment.passRate}% pass</span>
                </div>
              </div>

              {/* Progress or CTA */}
              {assessment.userAttempt ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Your Score</span>
                    <span className="font-medium">{assessment.userAttempt.score}%</span>
                  </div>
                  <Progress value={assessment.userAttempt.score} />
                  <p className="text-xs text-charcoal-500">
                    {assessment.userAttempt.passed ? 'Passed' : 'Not passed'}
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full"
                  variant="outline"
                  asChild
                >
                  <Link href={`/dashboard/student/assessments/${assessment._id}`}>
                    View Details
                  </Link>
                </Button>
              )}
            </div>
          </Link>
        </Card>
      ))}
    </div>
  );
}