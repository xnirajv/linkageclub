'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, Clock, Trophy } from 'lucide-react';
import Link from 'next/link';

interface Step {
  id: string;
  title: string;
  type: 'video' | 'article' | 'assessment' | 'project';
  duration?: string;
  completed: boolean;
  locked: boolean;
}

interface LearningPathProps {
  pathId?: string;
  title: string;
  description?: string;
  progress: number;
  steps: Step[];
  estimatedTime?: string;
  certificateAvailable?: boolean;
}

export function LearningPath({ 
  title, 
  description, 
  progress, 
  steps,
  estimatedTime,
  certificateAvailable 
}: LearningPathProps) {
  const completedSteps = steps.filter(s => s.completed).length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {estimatedTime && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {estimatedTime}
              </Badge>
            )}
            <Badge variant="outline">{progress}%</Badge>
          </div>
        </div>
        <Progress value={progress} className="mt-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>{completedSteps}/{steps.length} steps completed</span>
          {certificateAvailable && progress === 100 && (
            <span className="flex items-center gap-1 text-primary-600">
              <Trophy className="h-3 w-3" />
              Certificate Available
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                step.completed ? 'bg-success-50 border-success-200' :
                step.locked ? 'opacity-50 bg-muted' : 'hover:bg-muted cursor-pointer'
              }`}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-success-600" />
                ) : step.locked ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-primary-600 flex items-center justify-center text-xs font-bold text-primary-600">
                    {i + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{step.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" size="sm" className="capitalize text-xs">{step.type}</Badge>
                  {step.duration && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.duration}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!step.locked && !step.completed && (
                  <Button size="xs" asChild>
                    <Link href={`/dashboard/student/learn/resources/${step.id}`}>Start</Link>
                  </Button>
                )}
                {step.completed && (
                  <Badge variant="success" size="sm">Completed</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}