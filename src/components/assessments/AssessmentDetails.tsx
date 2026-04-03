'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  Award, 
  Star, 
  Users, 
  TrendingUp,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

interface AssessmentDetailsProps {
  assessment: {
    _id: string;
    title: string;
    description: string;
    skillName: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    price: number;
    duration: number;
    passingScore: number;
    questions: any[];
    badges?: Array<{
      name: string;
      description: string;
      image: string;
      requiredScore: number;
    }>;
    totalAttempts: number;
    passRate: number;
    averageScore: number;
    prerequisites?: string[];
    tags?: string[];
  };
  userAttempt?: {
    score: number;
    passed: boolean;
    completedAt: Date;
  };
  onStart?: () => void;
  isAuthenticated?: boolean;
}

export function AssessmentDetails({ 
  assessment, 
  userAttempt, 
  onStart, 
  isAuthenticated 
}: AssessmentDetailsProps) {
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

  const getDifficultyLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-charcoal-950">{assessment.title}</h1>
            <Badge className={getLevelColor(assessment.level)}>
              {getDifficultyLabel(assessment.level)}
            </Badge>
          </div>
          <p className="text-charcoal-600">{assessment.description}</p>
        </div>
        {!userAttempt && (
          <Button size="lg" onClick={onStart} disabled={!isAuthenticated}>
            {assessment.price > 0 ? `Pay ${formatCurrency(assessment.price)} & Start` : 'Start Assessment'}
          </Button>
        )}
      </div>

      {/* User Attempt Status */}
      {userAttempt && (
        <Card className={`p-4 ${userAttempt.passed ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {userAttempt.passed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">
                  {userAttempt.passed ? 'You passed this assessment!' : 'Assessment completed'}
                </p>
                <p className="text-sm text-charcoal-600">
                  Score: {userAttempt.score}% • Completed on {new Date(userAttempt.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onStart}>Retake Assessment</Button>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Duration</p>
              <p className="font-semibold">{assessment.duration} minutes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Price</p>
              <p className="font-semibold">
                {assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Passing Score</p>
              <p className="font-semibold">{assessment.passingScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Questions</p>
              <p className="font-semibold">{assessment.questions?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Assessment Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-charcoal-500 mb-2">Total Attempts</p>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-charcoal-400" />
              <span className="text-2xl font-bold">{formatNumber(assessment.totalAttempts)}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-charcoal-500 mb-2">Pass Rate</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-charcoal-400" />
              <span className="text-2xl font-bold">{assessment.passRate}%</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-charcoal-500 mb-2">Average Score</p>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-charcoal-400" />
              <span className="text-2xl font-bold">{assessment.averageScore}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Prerequisites */}
      {assessment.prerequisites && assessment.prerequisites.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
          <div className="space-y-2">
            {assessment.prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{prereq}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Badges */}
      {assessment.badges && assessment.badges.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Earnable Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessment.badges.map((badge, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-sm text-charcoal-500">{badge.description}</p>
                  <p className="text-xs text-charcoal-400 mt-1">
                    Required Score: {badge.requiredScore}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tags */}
      {assessment.tags && assessment.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {assessment.tags.map((tag, index) => (
            <Badge key={index} variant="skill">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}