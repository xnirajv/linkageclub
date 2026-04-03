'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SaveJobButtonProps {
  jobId: string;
  isSaved?: boolean;
  onSave?: (saved: boolean) => void;
}

export function SaveJobButton({ jobId, isSaved = false, onSave }: SaveJobButtonProps) {
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setSaved(data.saved);
        onSave?.(data.saved);
      }
    } catch (error) {
      console.error('Failed to save job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSave}
      isLoading={isLoading}
      title={saved ? 'Unsave job' : 'Save job'}
    >
      <Bookmark className={cn('h-4 w-4', saved && 'fill-primary-600 text-primary-600')} />
    </Button>
  );
}