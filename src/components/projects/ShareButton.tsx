'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  projectId: string;
  title: string;
}

export function ShareButton({ projectId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard/student/projects/${projectId}`;
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    await fetch(`/api/projects/${projectId}/share`, { method: 'POST' }).catch(() => {});
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}