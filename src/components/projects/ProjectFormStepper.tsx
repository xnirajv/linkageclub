'use client';

import React from 'react';
import { Check } from 'lucide-react';

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

export function ProjectFormStepper({ currentStep, totalSteps, steps, onStepClick, errors }: ProjectFormStepperProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isLast = stepNumber === totalSteps;
        
        return (
          <React.Fragment key={index}>
            <button
              onClick={() => onStepClick(stepNumber)}
              disabled={!isCompleted && !isActive}
              className={`flex flex-col items-center gap-1 ${
                isCompleted ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              <span className="text-[10px] text-gray-500 hidden sm:block">{step.subtitle}</span>
            </button>
            
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  stepNumber < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}