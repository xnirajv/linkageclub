'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/forms/RadioGroup';
import { useAssessment } from '@/hooks/useAssessments';
import { Label } from '@/components/ui/lable';

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { assessment, startAssessment, submitAssessment, isLoading } = useAssessment(id);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptStarted, setAttemptStarted] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!attemptStarted && id) {
        const result = await startAssessment(id);
        if (result.success && result.data) {
          setAnswers(result.data.existingAnswers || new Array(result.data.questions?.length || 0).fill(-1));
          setTimeLeft((result.data.duration * 60) - (result.data.timeSpent || 0));
          setAttemptStarted(true);
        }
      }
    };
    init();
  }, [id, startAssessment, attemptStarted]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (isLoading || !assessment || !attemptStarted) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentQuestion];
  const total = questions.length;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev =>
      prev.includes(currentQuestion) ? prev.filter(q => q !== currentQuestion) : [...prev, currentQuestion]
    );
  };

  const handleNext = () => currentQuestion < total - 1 && setCurrentQuestion(prev => prev + 1);
  const handlePrevious = () => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const timeSpent = (assessment.duration * 60) - timeLeft;
      const result = await submitAssessment(answers, timeSpent);
      if (result.success) {
        router.push(`/dashboard/student/assessments/${id}/results`);
      } else {
        alert(result.error || 'Failed to submit');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = answers.filter(a => a !== -1).length;
  const progress = (answeredCount / total) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{assessment.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600"><Clock className="h-5 w-5" /><span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-600' : ''}`}>{formatTime(timeLeft)}</span></div>
              <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
          <p className="text-xs text-gray-400 mt-1 text-right">{answeredCount} of {total} answered</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {total}</span>
              {markedForReview.includes(currentQuestion) && <span className="text-sm text-yellow-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Marked for Review</span>}
            </div>
            <h2 className="text-lg font-medium mb-6">{currentQ?.question}</h2>
            <RadioGroup value={answers[currentQuestion]?.toString()} onValueChange={handleAnswer} className="space-y-3">
              {currentQ?.options?.map((opt: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                  <Label htmlFor={`opt-${idx}`}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>Previous</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleMarkForReview}>{markedForReview.includes(currentQuestion) ? 'Unmark' : 'Mark for Review'}</Button>
                {currentQuestion === total - 1 ? (
                  <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
                ) : (
                  <Button onClick={handleNext}>Next</Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-24">
            <h3 className="font-medium mb-3">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_: any, idx: number) => {
                let bg = 'bg-gray-100';
                if (answers[idx] !== -1) bg = 'bg-green-100 text-green-700';
                else if (markedForReview.includes(idx)) bg = 'bg-yellow-100 text-yellow-700';
                return <button key={idx} onClick={() => setCurrentQuestion(idx)} className={`w-8 h-8 rounded-md text-sm font-medium ${bg} ${currentQuestion === idx ? 'ring-2 ring-primary-500' : ''}`}>{idx + 1}</button>;
              })}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 rounded" />Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-100 rounded" />Marked for Review</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-100 rounded" />Not Visited</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}