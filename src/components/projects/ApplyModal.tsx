'use client';

import React, { useState } from 'react';
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

  const handleSubmit = async () => {
    if (!coverLetter || !proposedAmount) return;
    setIsSubmitting(true);
    try {
      const result = await applyToProject(project._id, {
        coverLetter,
        proposedAmount: Number(proposedAmount),
        proposedDuration: Number(proposedDuration),
        attachments: [],
      });
      if (result.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Apply for {project.title}</ModalTitle>
        </ModalHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Proposed Amount (₹) <span className="text-error-600">*</span>
              </label>
              <input
                type="number"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                placeholder={`Budget: ₹${project.budget?.min}–₹${project.budget?.max}`}
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Letter <span className="text-error-600">*</span>
            </label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[150px]"
              placeholder="Describe your approach, relevant experience, and why you're a great fit for this project..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!coverLetter || !proposedAmount}>
            Submit Proposal
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
