'use client';

import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/forms/Textarea';
import { toast } from 'sonner';

interface RejectMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestone: { _id: string; title: string };
  onSuccess: () => void;
}

const rejectionReasons = [
  'Quality not met',
  'Deliverables incomplete',
  'Does not match requirements',
  'Other',
];

export function RejectMilestoneModal({ isOpen, onClose, projectId, milestone, onSuccess }: RejectMilestoneModalProps) {
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReject = async () => {
    if (!reason) { toast.error('Select a reason'); return; }
    if (!feedback.trim() || feedback.length < 20) { toast.error('Min 20 characters feedback required'); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId: milestone._id, status: 'pending', feedback: `${reason}: ${feedback}` }),
      });
      if (res.ok) { toast.success('Milestone rejected'); onSuccess(); onClose(); }
      else { const data = await res.json(); toast.error(data.error || 'Failed'); }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">Reject Milestone</h2>
        <p className="text-sm text-gray-500 mb-4">{milestone.title}</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Reason *</label>
            <div className="space-y-2">{rejectionReasons.map((r) => (<label key={r} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="reason" value={r} checked={reason === r} onChange={(e) => setReason(e.target.value)} className="text-blue-600" /><span className="text-sm">{r}</span></label>))}</div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Detailed Feedback *</label>
            <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Explain why..." rows={4} className="rounded-xl" />
            <p className="text-xs text-gray-400 mt-1">Min 20 characters</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading}>{loading ? 'Rejecting...' : <><XCircle className="h-4 w-4 mr-1" />Confirm Rejection</>}</Button>
        </div>
      </div>
    </div>
  );
}