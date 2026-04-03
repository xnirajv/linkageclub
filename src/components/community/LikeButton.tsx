'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LikeButtonProps {
  postId: string;
  likes: number;
  isLiked?: boolean;
  onLike?: (postId: string) => void;
}

export function LikeButton({ postId, likes, isLiked = false, onLike }: LikeButtonProps) {
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState(likes);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' });
      onLike?.(postId);
    } catch {
      setLiked(!newLiked);
      setCount((c) => (newLiked ? c - 1 : c + 1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLike} className="gap-1.5 text-muted-foreground">
      <Heart className={cn('h-4 w-4 transition-colors', liked && 'fill-error-500 text-error-500')} />
      <span className="text-xs">{count}</span>
    </Button>
  );
}