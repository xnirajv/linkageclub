'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  deadline: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
  projectId: string;
  onMilestoneUpdate?: () => void;
}

export function MilestoneTracker({ milestones, projectId, onMilestoneUpdate }: MilestoneTrackerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartMilestone = async (milestoneId: string) => {
    setLoadingId(milestoneId);
    try {
      const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}/start`, {
        method: 'POST',
      });
      if (response.ok) {
        onMilestoneUpdate?.();
      }
    } catch (error) {
      console.error('Failed to start milestone:', error);
    } finally {
      setLoadingId(null);
    }
  };

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No milestones added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Milestones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone._id || index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(milestone.status)}
                  <div>
                    <h4 className="font-medium">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(milestone.status)}>
                  {milestone.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-500">Amount: ₹{milestone.amount.toLocaleString()}</span>
                <span className="text-gray-500">Deadline: {milestone.deadline} days</span>
              </div>

              {milestone.status === 'pending' && (
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    onClick={() => handleStartMilestone(milestone._id!)}
                    disabled={loadingId === milestone._id}
                  >
                    {loadingId === milestone._id ? 'Starting...' : 'Start Milestone'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}