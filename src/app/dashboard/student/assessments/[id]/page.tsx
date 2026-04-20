'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAssessment } from '@/hooks/useAssessments';
import { Clock, DollarSign, Award, Star } from 'lucide-react';
import { usePayments } from '@/hooks/usePayment';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { assessment, isLoading } = useAssessment(params.id as string);
  const { initializeRazorpay, isProcessing } = usePayments();

  if (isLoading) {
    return (
        <div>Loading...</div>
    );
  }

  if (!assessment) {
    return (
        <div>Assessment not found</div>
    );
  }

  const handleStartAssessment = async () => {
    if (assessment.price > 0) {
      // Initiate payment
      await initializeRazorpay({
        amount: assessment.price,
        type: 'assessment',
        purpose: `Assessment: ${assessment.title}`,
        assessmentId: assessment._id,
      });
    } else {
      // Start free assessment
      router.push(`/dashboard/student/assessments/${assessment._id}/take`);
    }
  };

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            {assessment.title}
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            {assessment.description}
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {assessment.price === 0 ? 'Free' : `₹${assessment.price}`}
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
        </div>

        {/* Skills and Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Assessment Details</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-charcoal-500 mb-2">Skill</p>
              <Badge variant="skill" size="lg">
                {assessment.skillName}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-charcoal-500 mb-2">Level</p>
              <Badge variant="skill" size="lg">
                {assessment.level}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-charcoal-500 mb-2">Questions</p>
              <p className="font-medium">{assessment.questions?.length || 0} questions</p>
            </div>

            <div>
              <p className="text-sm text-charcoal-500 mb-2">Statistics</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold">{assessment.totalAttempts}</p>
                  <p className="text-xs text-charcoal-500">Total Attempts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{assessment.passRate}%</p>
                  <p className="text-xs text-charcoal-500">Pass Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{assessment.averageScore}%</p>
                  <p className="text-xs text-charcoal-500">Avg. Score</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Badges */}
        {assessment.badges && assessment.badges.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Earnable Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.badges.map((badge: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-sm text-charcoal-500">Score {badge.requiredScore}%+</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={handleStartAssessment}
            isLoading={isProcessing}
          >
            {assessment.price > 0 ? `Pay ₹${assessment.price} & Start` : 'Start Assessment'}
          </Button>
          <Button size="lg" variant="outline">
            View Sample Questions
          </Button>
        </div>
      </div>
  );
}