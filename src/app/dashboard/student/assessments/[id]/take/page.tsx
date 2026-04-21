'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertCircle } from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessments';
import { RadioGroup, RadioGroupItem } from '@/components/forms/RadioGroup';
import { Label } from '@/components/ui/lable';

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { assessment, submitAssessment, isLoading } = useAssessment(params.id as string);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assessment) {
      setTimeLeft(assessment.duration * 60);
      setAnswers(new Array(assessment.questions?.length || 0).fill(-1));
    }
  }, [assessment]);

  // ✅ FIXED: Timer only counts down, does NOT auto-submit
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (isLoading || !assessment) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentQuestion];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    if (markedForReview.includes(currentQuestion)) {
      setMarkedForReview(prev => prev.filter(q => q !== currentQuestion));
    } else {
      setMarkedForReview(prev => [...prev, currentQuestion]);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeSpent = (assessment.duration * 60) - timeLeft;
      const result = await submitAssessment(answers, timeSpent);
      
      if (result.success) {
        router.push(`/dashboard/student/assessments/${assessment._id}/results`);
        router.refresh();
      } else {
        alert(result.error || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = answers.filter(a => a !== -1).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card dark:bg-charcoal-800 border-b sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{assessment.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-charcoal-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
            <Progress value={progress} className="mt-2" />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-charcoal-500">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                {markedForReview.includes(currentQuestion) && (
                  <span className="text-sm text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Marked for Review
                  </span>
                )}
              </div>

              <h2 className="text-lg font-medium mb-6">
                {currentQ?.question}
              </h2>

              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQ?.options?.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex items-center justify-between mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleMarkForReview}
                  >
                    {markedForReview.includes(currentQuestion) ? 'Unmark' : 'Mark for Review'}
                  </Button>
                  {currentQuestion === questions.length - 1 ? (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>Next</Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-medium mb-3">Question Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_: any, index: number) => {
                  let bgColor = 'bg-gray-100';
                  if (answers[index] !== -1) {
                    bgColor = 'bg-green-100 text-green-700';
                  } else if (markedForReview.includes(index)) {
                    bgColor = 'bg-yellow-100 text-yellow-700';
                  }

                  return (
                    <button
                      key={index}
                      className={`w-8 h-8 rounded-md text-sm font-medium ${bgColor} ${
                        currentQuestion === index ? 'ring-2 ring-primary-500' : ''
                      }`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded" />
                  <span>Not Visited</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
  );
}