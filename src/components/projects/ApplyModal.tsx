'use client';

import React, { useEffect, useState } from 'react';
import type { Project } from '@/types/project';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProjectActions } from '@/hooks/useProjects';

interface ApplyModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export function ApplyModal({ project, isOpen, onClose, onApplied }: ApplyModalProps) {
  const { applyToProject } = useProjectActions();
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [proposedDuration, setProposedDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCoverLetter('');
    setProposedAmount('');
    setProposedDuration(String(project.duration));
    setError(null);
    setSuccess(null);
  }, [isOpen, project.duration]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const amount = Number(proposedAmount);
    const duration = Number(proposedDuration);

    if (!coverLetter.trim()) { setError('Cover letter is required.'); return; }
    if (!proposedAmount || Number.isNaN(amount) || amount <= 0) { setError('Enter a valid amount.'); return; }
    if (project.budget && (amount < project.budget.min || amount > project.budget.max)) {
      setError(`Amount must be between Rs. ${project.budget.min.toLocaleString()} and Rs. ${project.budget.max.toLocaleString()}.`);
      return;
    }
    if (Number.isNaN(duration) || duration <= 0) { setError('Enter a valid duration.'); return; }
    if (duration > project.duration) { setError(`Duration cannot exceed ${project.duration} days.`); return; }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await applyToProject(project._id, {
      coverLetter: coverLetter.trim(),
      proposedAmount: amount,
      proposedDuration: duration,
      attachments: [],
    });

    if (!result.success) {
      setError(result.error || 'Failed to submit proposal.');
      setIsSubmitting(false);
      return;
    }

    setSuccess('Proposal submitted successfully.');
    onApplied?.();
    setIsSubmitting(false);
    setTimeout(() => onClose(), 1200);
  };

  const budgetText = project.budget
    ? `Rs. ${project.budget.min?.toLocaleString() || '?'} - Rs. ${project.budget.max?.toLocaleString() || '?'}`
    : 'Not specified';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{success}</div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Proposed Amount (INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={`Budget: ${budgetText}`}
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                disabled={isSubmitting || Boolean(success)}
                min="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Proposed Duration (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={`Project duration: ${project.duration} days`}
                value={proposedDuration}
                onChange={(e) => setProposedDuration(e.target.value)}
                disabled={isSubmitting || Boolean(success)}
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              className="min-h-[150px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Describe your approach and relevant experience..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              disabled={isSubmitting || Boolean(success)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || Boolean(success)}>
            {success ? 'Applied' : 'Submit Proposal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}