'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useProjectActions } from '@/hooks/useProjects';

interface SaveButtonProps {
  projectId: string;
  isSaved?: boolean;
  onSave?: (saved: boolean) => void;
}

export function SaveButton({ projectId, isSaved = false, onSave }: SaveButtonProps) {
  const { saveProject } = useProjectActions();
  const [saved, setSaved] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleSave = async () => {
    if (isLoading) return;

    const previousValue = saved;
    const optimisticValue = !saved;

    setIsLoading(true);
    setError(null);
    setSaved(optimisticValue);
    onSave?.(optimisticValue);

    const result = await saveProject(projectId);
    if (!result.success || !result.data) {
      setSaved(previousValue);
      onSave?.(previousValue);
      setError(result.error || 'Failed to update');
      setIsLoading(false);
      return;
    }

    setSaved(result.data.saved);
    onSave?.(result.data.saved);
    setIsLoading(false);
  };

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        size="icon"
        onClick={handleSave}
        disabled={isLoading}
        aria-pressed={saved}
        title={saved ? 'Remove from saved' : 'Save project'}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        ) : (
          <Bookmark className={cn('h-4 w-4', saved && 'fill-primary-600 text-primary-600')} />
        )}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}