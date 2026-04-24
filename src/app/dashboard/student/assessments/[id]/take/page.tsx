'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuestionDisplay } from '@/components/assessments/QuestionDisplay';
import { QuestionPalette } from '@/components/assessments/QuestionPalette';
import { Timer } from '@/components/assessments/Timer';
import { useAssessment } from '@/hooks/useAssessments';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const { assessment, submitAssessment, isLoading } = useAssessment(assessmentId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Initialize assessment
  useEffect(() => {
    const initAssessment = async () => {
      try {
        const response = await fetch(
          `/api/assessments/${assessmentId}/start`,
          { method: 'POST' }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error);
        }

        const data = await response.json();
        setAttemptId(data.attemptId);
        setTimeLeft(data.timeLeft || data.duration * 60);
        setStartedAt(new Date(data.startedAt));
        
        // Initialize answers array
        const questionCount = data.questions?.length || 0;
        setAnswers(new Array(questionCount).fill(-1));
        setCurrentQuestion(0);
      } catch (error: any) {
        console.error('Failed to start assessment:', error);
        alert(error.message || 'Failed to start assessment');
        router.push(`/dashboard/student/assessments/${assessmentId}`);
      }
    };

    initAssessment();
  }, [assessmentId, router]);

  const handleTimeUp = useCallback(() => {
    handleSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const handleAnswer = (answer: number | number[]) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = Array.isArray(answer) ? answer[0] : answer;
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prev) =>
      prev.includes(currentQuestion)
        ? prev.filter((q) => q !== currentQuestion)
        : [...prev, currentQuestion]
    );
  };

  const handleNext = () => {
    if (currentQuestion < answers.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowSubmitDialog(false);
    
    const timeSpent = Math.floor(
      (Date.now() - (startedAt?.getTime() || Date.now())) / 1000
    );

    const result = await submitAssessment(answers, timeSpent);

    if (result.success) {
      router.push(
        `/dashboard/student/assessments/${assessmentId}/results`
      );
    } else {
      alert(result.error || 'Failed to submit assessment');
      setIsSubmitting(false);
    }
  };

  if (isLoading || !assessment || answers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentQuestion];
  const answeredCount = answers.filter((a) => a !== -1 && a !== undefined).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold truncate max-w-md">
              {assessment.title}
            </h1>
            <div className="flex items-center gap-4">
              <Timer
                duration={assessment.duration * 60}
                onTimeUp={handleTimeUp}
                size="sm"
                showProgress={false}
                className="border-0 shadow-none p-0"
              />
              <Button
                variant="destructive"
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area */}
        <div className="lg:col-span-3 space-y-4">
          {currentQ && (
            <QuestionDisplay
              question={currentQ}
              index={currentQuestion}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestion]}
              onAnswer={handleAnswer}
              onMarkForReview={handleMarkForReview}
              isMarked={markedForReview.includes(currentQuestion)}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={isSubmitting}
                >
                  Submit Assessment
                </Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="lg:col-span-1">
          <QuestionPalette
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answers={answers}
            markedForReview={markedForReview}
            onQuestionSelect={setCurrentQuestion}
            onSubmit={() => setShowSubmitDialog(true)}
            timeLeft={timeLeft}
          />
        </div>
      </div>

      {/* Submit Confirmation Dialog - Using Dialog instead of AlertDialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Submit Assessment
            </DialogTitle>
            <DialogDescription>
              <div className="space-y-3 mt-2">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to submit this assessment?
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm space-y-1">
                  <p>
                    <strong>Total Questions:</strong> {questions.length}
                  </p>
                  <p>
                    <strong>Answered:</strong>{' '}
                    <span className="text-green-600 font-medium">{answeredCount}</span>
                  </p>
                  <p>
                    <strong>Not Answered:</strong>{' '}
                    <span className="text-red-600 font-medium">
                      {questions.length - answeredCount}
                    </span>
                  </p>
                  <p>
                    <strong>Marked for Review:</strong>{' '}
                    <span className="text-yellow-600 font-medium">
                      {markedForReview.length}
                    </span>
                  </p>
                  {timeLeft > 0 && (
                    <p>
                      <strong>Time Left:</strong>{' '}
                      {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                    </p>
                  )}
                </div>
                {questions.length - answeredCount > 0 && (
                  <p className="text-yellow-600 text-sm font-medium">
                    ⚠️ Warning: You have {questions.length - answeredCount} unanswered questions!
                  </p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              className="w-full sm:w-auto"
            >
              Continue Assessment
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Assessment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}