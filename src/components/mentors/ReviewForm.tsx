'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ReviewFormProps {
  sessionId: string;
  mentorId: string;
  onSubmit?: () => void;
}

export function ReviewForm({ sessionId, mentorId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !comment) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/mentors/${mentorId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, rating, comment }),
      });
      setSubmitted(true);
      onSubmit?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="text-success-600 font-medium">Thank you for your review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  star <= (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-charcoal-300'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Review</label>
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[100px]"
          placeholder="Share your experience with this mentor..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!rating || !comment.trim()} fullWidth>
        Submit Review
      </Button>
    </div>
  );
}