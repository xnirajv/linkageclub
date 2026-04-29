'use client';

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

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
  const hasErrors = Object.keys(errors).length > 0;

  const getStepErrorMap = () => {
    const map: Record<number, boolean> = {};
    if (errors.title || errors.category || errors.description) map[1] = true;
    if (errors.skills || errors.experienceLevel || errors.locationType) map[2] = true;
    if (errors.budgetType || errors.duration || errors.budgetMin || errors.budgetMax) map[3] = true;
    if (errors.termsAccepted) map[4] = true;
    return map;
  };

  const stepErrors = getStepErrorMap();

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const hasError = stepErrors[stepNumber];
        const isLast = stepNumber === totalSteps;

        return (
          <React.Fragment key={index}>
            <button
              onClick={() => isCompleted && onStepClick(stepNumber)}
              disabled={!isCompleted && !isActive}
              className={`flex flex-col items-center gap-1 transition-all ${
                isCompleted ? 'cursor-pointer hover:scale-105' : isActive ? 'cursor-default' : 'cursor-not-allowed opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  hasError
                    ? 'bg-red-100 border-2 border-red-500 text-red-600'
                    : isCompleted
                    ? 'bg-green-500 text-white shadow-md'
                    : isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {hasError ? <AlertCircle className="h-5 w-5" /> : isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${
                hasError ? 'text-red-600' : isActive ? 'text-blue-700 font-bold' : isCompleted ? 'text-green-700' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
              <span className="text-[10px] text-gray-500 hidden sm:block">{step.subtitle}</span>
            </button>

            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}