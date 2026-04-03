'use client';

import React, { useState } from 'react';
import { Mentor } from '@/types/mentor';
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useMentors } from '@/hooks/useMentors';
import { IndianRupee } from 'lucide-react';

interface BookingModalProps {
  mentor: Mentor;
  isOpen: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS = [30, 60, 90];

export function BookingModal({ mentor, isOpen, onClose }: BookingModalProps) {
  const { bookSession } = useMentors();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amount = Math.round((mentor.hourlyRate * duration) / 60);

  const handleSubmit = async () => {
    if (!topic || !date || !time) return;
    setIsSubmitting(true);
    try {
      const sessionDate = new Date(`${date}T${time}`);
      const result = await bookSession(mentor._id, {
        topic,
        description,
        date: sessionDate,
        duration,
        amount,
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
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>Book a Session</ModalTitle>
        </ModalHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Topic <span className="text-error-600">*</span></label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              placeholder="What do you want to discuss?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[80px]"
              placeholder="Provide more context about what you need help with..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date <span className="text-error-600">*</span></label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time <span className="text-error-600">*</span></label>
              <input
                type="time"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration</label>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${
                    duration === d ? 'bg-primary-600 text-white border-primary-600' : 'bg-background hover:bg-muted'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Total Amount</span>
            <div className="flex items-center gap-1 font-bold text-lg">
              <IndianRupee className="h-5 w-5" />
              {amount.toLocaleString()}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!topic || !date || !time}>
            Confirm Booking
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
