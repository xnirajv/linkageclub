'use client';

import React, { useEffect, useState } from 'react';
import { Project } from '@/types/project';
import {
  Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle,
} from '@/components/ui/modal';
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
    if (!isOpen) {
      return;
    }

    setCoverLetter('');
    setProposedAmount('');
    setProposedDuration(String(project.duration));
    setError(null);
    setSuccess(null);
  }, [isOpen, project.duration]);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const amount = Number(proposedAmount);
    const duration = Number(proposedDuration);

    if (!coverLetter.trim()) {
      setError('Cover letter is required.');
      return;
    }

    if (!proposedAmount || Number.isNaN(amount) || amount <= 0) {
      setError('Enter a valid proposed amount.');
      return;
    }

    if (project.budget && (amount < project.budget.min || amount > project.budget.max)) {
      setError(`Amount must be between Rs. ${project.budget.min.toLocaleString()} and Rs. ${project.budget.max.toLocaleString()}.`);
      return;
    }

    if (Number.isNaN(duration) || duration <= 0) {
      setError('Enter a valid proposed duration.');
      return;
    }

    if (duration > project.duration) {
      setError(`Duration cannot exceed ${project.duration} days.`);
      return;
    }

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

    window.setTimeout(() => {
      onClose();
    }, 1200);
  };

  const budgetText = project.budget
    ? `Rs. ${project.budget.min?.toLocaleString() || '?'} - Rs. ${project.budget.max?.toLocaleString() || '?'}`
    : 'Not specified';

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Apply for {project.title}</ModalTitle>
        </ModalHeader>

        <div className="space-y-4 py-4">
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="project-apply-amount" className="mb-1 block text-sm font-medium">
                Proposed Amount (INR) <span className="text-red-500">*</span>
              </label>
              <input
                id="project-apply-amount"
                type="number"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={`Budget: ${budgetText}`}
                value={proposedAmount}
                onChange={(event) => setProposedAmount(event.target.value)}
                disabled={isSubmitting || Boolean(success)}
                min="1"
              />
            </div>
            <div>
              <label htmlFor="project-apply-duration" className="mb-1 block text-sm font-medium">
                Proposed Duration (days) <span className="text-red-500">*</span>
              </label>
              <input
                id="project-apply-duration"
                type="number"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={`Project duration: ${project.duration} days`}
                value={proposedDuration}
                onChange={(event) => setProposedDuration(event.target.value)}
                disabled={isSubmitting || Boolean(success)}
                min="1"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-apply-cover-letter" className="mb-1 block text-sm font-medium">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              id="project-apply-cover-letter"
              className="min-h-[150px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Describe your approach, relevant experience, and why you're a great fit for this project..."
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              disabled={isSubmitting || Boolean(success)}
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting || Boolean(success)}
          >
            {success ? 'Applied' : 'Submit Proposal'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
