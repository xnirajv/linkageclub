'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SaveButtonProps {
  projectId: string;
  isSaved?: boolean;
  onSave?: (saved: boolean) => void;
}

export function SaveButton({ projectId, isSaved = false, onSave }: SaveButtonProps) {
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/save`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.saved);
        onSave?.(data.saved);
      }
    } catch (e) {
      console.error('Failed to save project:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleSave} 
      disabled={isLoading}
      title={saved ? 'Unsave' : 'Save'}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <Bookmark className={cn('h-4 w-4', saved && 'fill-primary-600 text-primary-600')} />
      )}
    </Button>
  );
}