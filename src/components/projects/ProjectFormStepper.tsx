'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Step {
  title: string;
  subtitle: string;
}

interface ProjectFormStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  onStepClick: (step: number) => void;
  errors: Record<string, string>;
}

const stepErrorKeys: Record<number, string[]> = {
  1: ['title', 'category', 'description'],
  2: ['skills', 'experienceLevel', 'locationType'],
  3: ['budgetType', 'duration'],
  4: ['termsAccepted'],
};

export function ProjectFormStepper({ currentStep, totalSteps, steps, onStepClick, errors }: ProjectFormStepperProps) {
  const hasError = (step: number) => (stepErrorKeys[step] || []).some((key) => errors[key]);

  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const num = index + 1;
        const completed = num < currentStep;
        const active = num === currentStep;
        const error = hasError(num) && !completed;

        return (
          <React.Fragment key={num}>
            <button onClick={() => completed && onStepClick(num)} disabled={!completed} className="flex flex-col items-center gap-2 group">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200',
                completed && 'bg-green-500 border-green-500 text-white',
                active && 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100',
                !completed && !active && !error && 'bg-gray-100 border-gray-200 text-gray-500',
                error && 'bg-red-50 border-red-400 text-red-600',
              )}>
                {completed ? <Check className="h-5 w-5" /> : num}
              </div>
              <div className="text-center">
                <p className={cn('text-xs font-medium hidden sm:block', completed && 'text-green-600', active && 'text-blue-600 font-bold', !completed && !active && 'text-gray-400')}>{step.title}</p>
                <p className="text-[10px] text-gray-400 hidden md:block">{step.subtitle}</p>
              </div>
            </button>
            {num < totalSteps && <div className={cn('flex-1 h-1 mx-2 rounded-full transition-all', completed ? 'bg-green-500' : 'bg-gray-200')} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}