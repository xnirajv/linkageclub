'use client';

import React, { useState } from 'react';
import { Job } from '@/types/job';
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/hooks/useJobs';

interface JobApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export function JobApplyModal({ job, isOpen, onClose }: JobApplyModalProps) {
  const { applyToJob } = useJobs();
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!resume) return;
    setIsSubmitting(true);
    try {
      const result = await applyToJob(job._id, {
        resume,
        coverLetter,
        answers: job.questions?.map((q, i) => ({
          question: q.question,
          answer: answers[i] || '',
        })),
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
          <ModalTitle>Apply for {job.title}</ModalTitle>
        </ModalHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Resume URL <span className="text-error-600">*</span>
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              placeholder="Paste your resume link (Google Drive, Dropbox, etc.)"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cover Letter</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[120px]"
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          {job.questions?.map((q, i) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-1">
                {q.question} {q.required && <span className="text-error-600">*</span>}
              </label>
              {q.type === 'text' ? (
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px]"
                  value={answers[i] || ''}
                  onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                />
              ) : q.type === 'yes-no' ? (
                <div className="flex gap-3">
                  {['Yes', 'No'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${i}`}
                        value={opt}
                        checked={answers[i] === opt}
                        onChange={() => setAnswers({ ...answers, [i]: opt })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {q.options?.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${i}`}
                        value={opt}
                        checked={answers[i] === opt}
                        onChange={() => setAnswers({ ...answers, [i]: opt })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!resume}>
            Submit Application
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
