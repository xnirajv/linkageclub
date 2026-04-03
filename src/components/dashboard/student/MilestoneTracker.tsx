'use client';

import React, { useState } from 'react';
import { Milestone } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, IndianRupee, Upload, FileText, AlertCircle } from 'lucide-react';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  projectId?: string;
  onSubmit?: (milestoneId: string, files?: File[]) => void;
  isSubmitting?: boolean;
}

const STATUS_VARIANTS: Record<string, any> = {
  pending: 'outline',
  in_progress: 'warning',
  completed: 'success',
  approved: 'verified',
  rejected: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function MilestoneTracker({ milestones, projectId, onSubmit, isSubmitting }: MilestoneTrackerProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  
  const completed = milestones.filter((m) => ['completed', 'approved'].includes(m.status)).length;
  const progress = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  const handleSubmit = async (milestoneId: string) => {
    setSubmittingId(milestoneId);
    try {
      await onSubmit?.(milestoneId);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Milestones</CardTitle>
          <span className="text-sm text-muted-foreground">{completed}/{milestones.length} completed</span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {milestones.map((milestone, i) => {
            const isCompleted = ['completed', 'approved'].includes(milestone.status);
            const isRejected = milestone.status === 'rejected';
            const isSubmittingThis = submittingId === milestone._id || isSubmitting;
            
            return (
              <div key={milestone._id || i} className={`p-3 border rounded-lg ${isRejected ? 'border-red-200 bg-red-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-success-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <Badge 
                        variant={STATUS_VARIANTS[milestone.status]} 
                        size="sm" 
                        className={`capitalize flex-shrink-0 ${isRejected ? 'bg-red-100 text-red-700' : ''}`}
                      >
                        {STATUS_LABELS[milestone.status] || milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {milestone.amount.toLocaleString()}
                      </span>
                      <span>Due in {milestone.deadline} days</span>
                      {milestone.filesRequired && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          Files required
                        </span>
                      )}
                    </div>
                    {isRejected && milestone.feedback && (
                      <div className="mt-2 p-2 bg-red-100/50 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-red-600 mt-0.5" />
                        <p className="text-xs text-red-700">{milestone.feedback}</p>
                      </div>
                    )}
                  </div>
                  {milestone.status === 'in_progress' && onSubmit && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleSubmit(milestone._id!)}
                      disabled={isSubmittingThis}
                      className="flex-shrink-0"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      {isSubmittingThis ? 'Submitting...' : 'Submit'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}