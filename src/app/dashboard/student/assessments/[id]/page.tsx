'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AssessmentDetails } from '@/components/assessments/AssessmentDetails';
import { useAssessment } from '@/hooks/useAssessments';
import { usePayments } from '@/hooks/usePayment';
import { Loader2 } from 'lucide-react';

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const { assessment, isLoading } = useAssessment(assessmentId);
  const { initializeRazorpay, isProcessing } = usePayments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Assessment not found</h2>
        <p className="text-gray-500 mt-2">
          The assessment you're looking for doesn't exist or has been removed.
        </p>
      </div>
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
      try {
        const result = await fetch(
          `/api/assessments/${assessment._id}/start`,
          { method: 'POST' }
        );

        if (result.ok) {
          router.push(
            `/dashboard/student/assessments/${assessment._id}/take`
          );
        } else {
          const error = await result.json();
          alert(error.error || 'Failed to start assessment');
        }
      } catch (error) {
        console.error('Error starting assessment:', error);
        alert('Failed to start assessment. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <AssessmentDetails
        assessment={assessment}
        userAttempt={assessment.userAttempt}
        onStart={handleStartAssessment}
        isAuthenticated={true}
        isProcessing={isProcessing}
      />
    </div>
  );
}