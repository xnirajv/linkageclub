'use client';

import React, { useState, useEffect } from 'react';
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
    if (!coverLetter.trim()) {
      setError('Cover letter is required');
      return;
    }
    if (!proposedAmount) {
      setError('Proposed amount is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await applyToProject(project._id, {
        coverLetter: coverLetter.trim(),
        proposedAmount: Number(proposedAmount),
        proposedDuration: proposedDuration ? Number(proposedDuration) : project.duration,
        attachments: [],
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to submit proposal');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetText = project.budget
    ? `₹${project.budget.min?.toLocaleString() || '?'}–₹${project.budget.max?.toLocaleString() || '?'}`
    : 'Not specified';

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Apply for {project.title}</ModalTitle>
        </ModalHeader>

        <div className="space-y-4 py-4">
          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
              ✅ Proposal submitted successfully!
            </div>
          )}

          {error && !success && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              ❌ {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Proposed Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                placeholder={`Budget: ${budgetText}`}
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                disabled={isSubmitting || success}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Proposed Duration (days)
              </label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                placeholder={`Project duration: ${project.duration} days`}
                value={proposedDuration}
                onChange={(e) => setProposedDuration(e.target.value)}
                disabled={isSubmitting || success}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[150px]"
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