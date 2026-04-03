'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle, ChevronRight, Briefcase, FileText, Users, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Deadline {
  _id: string;
  title: string;
  type: 'project' | 'assessment' | 'session';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
}

interface UpcomingDeadlinesProps {
  deadlines?: Deadline[];
  onMarkComplete?: (deadlineId: string) => void;
}

export function UpcomingDeadlines({ deadlines, onMarkComplete }: UpcomingDeadlinesProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const displayDeadlines = (deadlines || [
    {
      _id: '1',
      title: 'E-commerce Project Milestone 2',
      type: 'project',
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
    },
    {
      _id: '2',
      title: 'React Advanced Assessment',
      type: 'assessment',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
    },
    {
      _id: '3',
      title: 'Mentor Session Preparation',
      type: 'session',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low',
    },
  ]).filter(d => !completedIds.includes(d._id));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  const getDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'assessment': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'session': return <Users className="h-4 w-4 text-green-600" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const handleMarkComplete = (deadlineId: string) => {
    setCompletedIds([...completedIds, deadlineId]);
    onMarkComplete?.(deadlineId);
  };

  const overdueCount = displayDeadlines.filter(d => getDaysLeft(d.dueDate) === 'Overdue').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-600" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayDeadlines.map((deadline) => {
            const daysLeft = getDaysLeft(deadline.dueDate);
            const isOverdue = daysLeft === 'Overdue';
            
            return (
              <div key={deadline._id} className={`flex items-center justify-between p-3 border rounded-lg hover:bg-charcoal-100/50 transition-colors ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    deadline.type === 'project' ? 'bg-blue-100' :
                    deadline.type === 'assessment' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {getTypeIcon(deadline.type)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{deadline.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getPriorityColor(deadline.priority)}`} size="sm">
                        {deadline.priority}
                      </Badge>
                      <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-charcoal-500'}`}>
                        {daysLeft}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onMarkComplete && !isOverdue && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMarkComplete(deadline._id)}
                      title="Mark as done"
                    >
                      <CheckCircle2 className="h-4 w-4 text-charcoal-400 hover:text-green-600" />
                    </Button>
                  )}
                  <ChevronRight className="h-4 w-4 text-charcoal-400" />
                </div>
              </div>
            );
          })}
        </div>

        {displayDeadlines.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
            <p className="text-charcoal-500">No upcoming deadlines</p>
            <p className="text-xs text-charcoal-400 mt-1">All caught up! 🎉</p>
          </div>
        )}

        {overdueCount > 0 && (
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>{overdueCount} overdue task{overdueCount !== 1 ? 's' : ''}</span>
            </div>
            <Link href="/dashboard/student/deadlines" className="text-primary-600 hover:underline">
              View all
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}