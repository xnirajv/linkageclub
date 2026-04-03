'use client';

import React from 'react';
import { Post } from '@/types/community';
import { PostCard } from './PostCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageSquare } from 'lucide-react';
import { usePosts } from '@/hooks/useCommunity';
import { Skeleton } from '../ui/skeleton';

interface FeedProps {
  posts: Post[];
  isLoading?: boolean;
  emptyMessage?: string;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function Feed({ posts, isLoading, emptyMessage = 'No posts yet', onLike, onSave, onShare }: FeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={emptyMessage}
        description="Be the first to start a conversation"
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={onLike}
          onSave={onSave}
          onShare={onShare}
        />
      ))}
    </div>
  );
}