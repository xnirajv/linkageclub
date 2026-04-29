'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/forms/Textarea';
import { toast } from 'sonner';

interface RequestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestone: { _id: string; title: string };
  onSuccess: () => void;
}

export function RequestChangesModal({ isOpen, onClose, projectId, milestone, onSuccess }: RequestChangesModalProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!feedback.trim() || feedback.length < 10) {
      toast.error('Please provide at least 10 characters of feedback');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId: milestone._id, status: 'in_progress', feedback }),
      });
      if (res.ok) {
        toast.success('Changes requested');
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed');
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
        <h2 className="text-lg font-bold mb-1">Request Changes</h2>
        <p className="text-sm text-gray-500 mb-4">{milestone.title}</p>
        <div>
          <label className="text-sm font-medium mb-1 block">What needs to be changed? *</label>
          <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Describe the changes needed..." rows={4} className="rounded-xl" />
          <p className="text-xs text-gray-400 mt-1">Min 10 characters</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Sending...' : <><RotateCcw className="h-4 w-4 mr-1" />Send Feedback</>}</Button>
        </div>
      </div>
    </div>
  );
}