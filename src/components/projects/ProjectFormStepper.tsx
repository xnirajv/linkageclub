'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProjectFormStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{ title: string; subtitle: string }>;
  onStepClick: (step: number) => void;
  errors: Record<string, string>;
}

export function ProjectFormStepper({ currentStep, totalSteps, steps, onStepClick, errors }: ProjectFormStepperProps) {
  const hasStepError = (step: number): boolean => {
    const stepErrorKeys: Record<number, string[]> = {
      1: ['title', 'category', 'description'],
      2: ['skills', 'experienceLevel', 'locationType'],
      3: ['budgetType', 'budgetMin', 'budgetMax', 'duration'],
      4: ['termsAccepted'],
    };
    return (stepErrorKeys[step] || []).some((key) => errors[key]);
  };

  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const hasError = hasStepError(stepNumber) && !isCompleted;

        return (
          <React.Fragment key={stepNumber}>
            <button
              onClick={() => isCompleted && onStepClick(stepNumber)}
              disabled={!isCompleted}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  isActive && 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100',
                  !isCompleted && !isActive && !hasError && 'bg-gray-100 border-gray-200 text-gray-500',
                  hasError && 'bg-red-50 border-red-400 text-red-600',
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    'text-xs font-medium hidden sm:block',
                    isCompleted && 'text-green-600',
                    isActive && 'text-blue-600 font-bold',
                    !isCompleted && !isActive && 'text-gray-400',
                  )}
                >
                  {step.title}
                </p>
                <p className="text-[10px] text-gray-400 hidden md:block">{step.subtitle}</p>
              </div>
            </button>
            {stepNumber < totalSteps && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded-full transition-all duration-300',
                  isCompleted ? 'bg-green-500' : 'bg-gray-200',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}