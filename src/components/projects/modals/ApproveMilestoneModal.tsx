'use client';

import React, { useState } from 'react';
import { Star, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/forms/Textarea';
import { toast } from 'sonner';

interface ApproveMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestone: {
    _id: string;
    title: string;
    amount: number;
  };
  onSuccess: () => void;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export function ApproveMilestoneModal({ isOpen, onClose, projectId, milestone, onSuccess }: ApproveMilestoneModalProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: milestone._id,
          status: 'approved',
          feedback,
        }),
      });

      if (res.ok) {
        toast.success('Milestone approved & payment released!');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to approve');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">Approve Milestone</h2>
        <p className="text-sm text-gray-500 mb-4">{milestone.title}</p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Amount to Release:</span><span className="font-medium">{formatCurrency(milestone.amount)}</span></div>
          <div className="flex justify-between"><span>Platform Fee (10%):</span><span>{formatCurrency(Math.round(milestone.amount * 0.1))}</span></div>
          <div className="flex justify-between border-t pt-2"><span className="font-medium">Candidate Receives:</span><span className="font-bold text-green-600">{formatCurrency(Math.round(milestone.amount * 0.9))}</span></div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Feedback (Optional)</label>
            <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Great work! ..." rows={3} className="rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Rating</label>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((s) => (<button key={s} onClick={() => setRating(s)} className={`p-1 ${rating >= s ? 'text-yellow-500' : 'text-gray-300'}`}><Star className="h-6 w-6 fill-current" /></button>))}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApprove} disabled={loading}>{loading ? 'Processing...' : <><DollarSign className="h-4 w-4 mr-1" />Approve & Release {formatCurrency(milestone.amount)}</>}</Button>
        </div>
      </div>
    </div>
  );
}