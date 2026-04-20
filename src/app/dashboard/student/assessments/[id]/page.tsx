'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  DollarSign, 
  Award, 
  Users, 
  TrendingUp, 
  BookOpen, 
  Eye, 
  X,
  ChevronRight
} from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';
import { usePayments } from '@/hooks/usePayment';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { assessment, isLoading } = useAssessment(params.id as string);
  const { initializeRazorpay, isProcessing } = usePayments();
  const [showSampleQuestions, setShowSampleQuestions] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Assessment not found</h2>
        <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const handleStartAssessment = async () => {
    if (assessment.price > 0) {
      await initializeRazorpay({
        amount: assessment.price,
        type: 'assessment',
        purpose: `Assessment: ${assessment.title}`,
        assessmentId: assessment._id,
      });
    } else {
      router.push(`/dashboard/student/assessments/${assessment._id}/take`);
    }
  };

  // Get first 2 questions as sample
  const sampleQuestions = assessment.questions?.slice(0, 2) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
        <p className="text-gray-600 mt-1">{assessment.description}</p>
      </div>

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

      {/* Skills */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Skills</h2>
        <Badge variant="secondary" size="lg">
          {assessment.skillName}
        </Badge>
        <Badge className="ml-2" variant="outline">
          {assessment.level}
        </Badge>
      </Card>

      {/* Statistics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Users className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatNumber(assessment.totalAttempts || 0)}</p>
            <p className="text-sm text-gray-500">Total Attempts</p>
          </div>
          <div>
            <TrendingUp className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assessment.passRate || 0}%</p>
            <p className="text-sm text-gray-500">Pass Rate</p>
          </div>
          <div>
            <Award className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assessment.averageScore || 0}%</p>
            <p className="text-sm text-gray-500">Avg. Score</p>
          </div>
        </div>
      </Card>

      {/* Badges */}
      {assessment.badges && assessment.badges.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Earnable Badges</h2>
          <div className="space-y-3">
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button size="lg" onClick={handleStartAssessment} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : assessment.price > 0 ? `Pay ${formatCurrency(assessment.price)} & Start` : 'Start Assessment'}
        </Button>
        
        {/* Sample Questions Dialog */}
        <Dialog open={showSampleQuestions} onOpenChange={setShowSampleQuestions}>
          <DialogTrigger asChild>
            <Button size="lg" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Sample Questions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sample Questions</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {sampleQuestions.length > 0 ? (
                sampleQuestions.map((q: any, idx: number) => (
                  <div key={idx} className="border-b pb-4">
                    <p className="font-medium mb-2">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="space-y-1 ml-4">
                      {q.options?.map((opt: string, optIdx: number) => (
                        <p key={optIdx} className="text-sm text-gray-600">
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </p>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        Note: {q.explanation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No sample questions available.</p>
              )}
              <div className="flex justify-end pt-4">
                <Button onClick={() => setShowSampleQuestions(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}