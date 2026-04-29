'use client';

import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, RotateCcw, XCircle, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/forms/Textarea';
import { toast } from 'sonner';

interface MilestonesTabProps {
  project: any;
  refetch: () => void;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export function MilestonesTab({ project, refetch }: MilestonesTabProps) {
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const milestones = project?.milestones || [];
  const total = milestones.reduce((s: number, m: any) => s + (m.amount || 0), 0);
  const approved = milestones.filter((m: any) => m.status === 'approved').reduce((s: number, m: any) => s + (m.amount || 0), 0);
  const completed = milestones.filter((m: any) => m.status === 'approved').length;

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    pending: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Pending' },
    in_progress: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' },
    submitted: { icon: CheckCircle2, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Submitted' },
    completed: { icon: CheckCircle2, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Submitted' },
    approved: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  };

  const handleAction = async (milestoneId: string, action: string) => {
    setActionLoading(milestoneId);
    try {
      const res = await fetch(`/api/projects/${project._id}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status: action, feedback }),
      });
      if (res.ok) {
        toast.success(`Milestone ${action === 'approved' ? 'approved' : 'updated'}!`);
        setFeedbackId(null);
        setFeedback('');
        refetch();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div><span className="text-sm text-gray-500">Total</span><p className="font-bold">{formatCurrency(total)}</p></div>
          <div><span className="text-sm text-gray-500">Released</span><p className="font-bold text-green-600">{formatCurrency(approved)}</p></div>
          <div><span className="text-sm text-gray-500">Pending</span><p className="font-bold text-yellow-600">{formatCurrency(total - approved)}</p></div>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Progress</span>
          <p className="font-bold">{milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0}%</p>
        </div>
      </div>

      {milestones.map((milestone: any, idx: number) => {
        const config = statusConfig[milestone.status] || statusConfig.pending;
        const Icon = config.icon;
        const isSubmitted = milestone.status === 'submitted' || milestone.status === 'completed';

        return (
          <Card key={milestone._id} id={`ms-${milestone._id}`} className={`border shadow-sm ${isSubmitted ? 'border-yellow-300 bg-yellow-50/30' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}><Icon className={`h-4 w-4 ${config.color}`} /></div>
                  <div>
                    <h3 className="font-semibold">Milestone {idx + 1}: {milestone.title}</h3>
                    <p className="text-sm text-gray-500">
                      Amount: {formatCurrency(milestone.amount)} • Deadline: Day {milestone.deadline}
                      {milestone.submittedAt && ` • Submitted: ${new Date(milestone.submittedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <Badge className={config.bg + ' ' + config.color}>{config.label}</Badge>
              </div>

              {milestone.deliverables && <p className="text-sm text-gray-600 mb-3">📎 {milestone.deliverables}</p>}
              {milestone.feedback && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm mb-3">💬 {milestone.feedback}</div>}

              {milestone.status === 'in_progress' && milestone.progress !== undefined && (
                <div className="mb-3"><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progress</span><span>{milestone.progress}%</span></div><Progress value={milestone.progress} className="h-1.5" /></div>
              )}

              {isSubmitted && (
                <div className="space-y-3">
                  {feedbackId === milestone._id ? (
                    <div className="space-y-2">
                      <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Your feedback..." rows={3} className="rounded-xl" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAction(milestone._id, 'approved')} disabled={actionLoading === milestone._id}>{actionLoading === milestone._id ? '...' : <><CheckCircle2 className="h-4 w-4 mr-1" />Approve & Release</>}</Button>
                        <Button size="sm" variant="outline" onClick={() => handleAction(milestone._id, 'in_progress')} disabled={actionLoading === milestone._id}><RotateCcw className="h-4 w-4 mr-1" />Request Changes</Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(milestone._id, 'pending')} disabled={actionLoading === milestone._id}><XCircle className="h-4 w-4 mr-1" />Reject</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setFeedbackId(null); setFeedback(''); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setFeedbackId(milestone._id)}>Review</Button>
                    </div>
                  )}
                </div>
              )}

              {milestone.status === 'in_progress' && (
                <Button size="sm" variant="outline">Request Update</Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}