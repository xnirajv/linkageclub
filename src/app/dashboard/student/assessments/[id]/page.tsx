'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Award, Users, TrendingUp, BookOpen, Star, ChevronRight } from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';
import { usePayments } from '@/hooks/usePayment';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import Link from 'next/link';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { assessment, isLoading, startAssessment } = useAssessment(params.id as string);
  const { initializeRazorpay, isProcessing } = usePayments();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartAssessment = async () => {
    if (isStarting) return;
    setIsStarting(true);

    try {
      if (assessment?.price > 0) {
        await initializeRazorpay({
          amount: assessment.price,
          type: 'assessment',
          purpose: `Assessment: ${assessment.title}`,
          assessmentId: assessment._id,
        });
      } else {
        const result = await startAssessment(assessment._id);
        if (result.success) {
          router.push(`/dashboard/student/assessments/${assessment._id}/take`);
        } else {
          alert(result.error || 'Failed to start assessment');
        }
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Something went wrong');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'advanced': return 'bg-orange-100 text-orange-700';
      case 'expert': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isCompleted = assessment.userAttempt?.completedAt !== null && assessment.userAttempt?.completedAt !== undefined;
  const isInProgress = assessment.userAttempt && !isCompleted;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold">{assessment.title}</h1>
          <Badge className={getLevelColor(assessment.level)}>{assessment.level}</Badge>
          {assessment.userAttempt?.passed && (
            <Badge variant="success" className="bg-green-100 text-green-700">✅ Passed</Badge>
          )}
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

      {/* Skills */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Skills Covered</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" size="lg">{assessment.skillName}</Badge>
        </div>
      </Card>

      {/* Badges */}
      {assessment.badges && assessment.badges.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Earnable Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessment.badges.map((badge: any, idx: number) => (
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

      {/* User Progress (if attempted) */}
      {assessment.userAttempt && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-semibold mb-3">Your Progress</h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="text-3xl font-bold">{assessment.userAttempt.score}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={assessment.userAttempt.passed ? 'success' : 'warning'}>
                {assessment.userAttempt.passed ? 'Passed' : 'Not Passed'}
              </Badge>
            </div>
            {assessment.userAttempt.completedAt && (
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-medium">{new Date(assessment.userAttempt.completedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {isCompleted ? (
          <>
            <Button asChild size="lg">
              <Link href={`/dashboard/student/assessments/${assessment._id}/results`}>View Results</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/dashboard/student/assessments/${assessment._id}/take`}>Retake Assessment</Link>
            </Button>
          </>
        ) : isInProgress ? (
          <Button asChild size="lg">
            <Link href={`/dashboard/student/assessments/${assessment._id}/take`}>Continue Assessment</Link>
          </Button>
        ) : (
          <Button size="lg" onClick={handleStartAssessment} disabled={isStarting || isProcessing}>
            {isStarting || isProcessing ? 'Starting...' : (assessment.price > 0 ? `Pay ${formatCurrency(assessment.price)} & Start` : 'Start Assessment')}
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={() => window.open('#', '_blank')}>
          View Sample Questions <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
