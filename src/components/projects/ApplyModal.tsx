'use client';

import React, { useEffect, useState } from 'react';
import { Project } from '@/types/project';
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';

interface ApplyModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplyModal({ project, isOpen, onClose }: ApplyModalProps) {
  const { applyToProject } = useProjects();
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');
  const [proposedDuration, setProposedDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCoverLetter('');
      setProposedAmount('');
      setProposedDuration('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const amount = Number(proposedAmount);
    const duration = proposedDuration ? Number(proposedDuration) : project.duration;

    if (!coverLetter.trim()) {
      setError('Cover letter is required');
      return;
    }

    if (!proposedAmount || Number.isNaN(amount) || amount <= 0) {
      setError('Enter a valid proposed amount');
      return;
    }

    if (Number.isNaN(duration) || duration <= 0) {
      setError('Enter a valid proposed duration');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await applyToProject(project._id, {
        coverLetter: coverLetter.trim(),
        proposedAmount: amount,
        proposedDuration: duration,
        attachments: [],
      });

      if (!result.success) {
        setError(result.error || 'Failed to submit proposal');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
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
              Proposal submitted successfully.
            </div>
          )}

          {error && !success && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
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
                disabled={isSubmitting || success}
                min="1"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Proposed Duration (days)
              </label>
              <input
                type="number"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={`Project duration: ${project.duration} days`}
                value={proposedDuration}
                onChange={(e) => setProposedDuration(e.target.value)}
                disabled={isSubmitting || success}
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
              placeholder="Describe your approach, relevant experience, and why you're a great fit for this project..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              disabled={isSubmitting || success}
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || success || !coverLetter.trim() || !proposedAmount}
          >
            {isSubmitting ? 'Submitting...' : success ? 'Submitted!' : 'Submit Proposal'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
