'use client';

import React, { useState } from 'react';
import { Comment } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils/cn';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment?: (content: string, parentId?: string) => void;
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (id: string) => void }) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const replies = Array.isArray(comment.replies) ? comment.replies : [];

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((c) => (newLiked ? c + 1 : c - 1));
    await fetch(`/api/community/comments/${comment._id}/like`, { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author?.avatar} />
        <AvatarFallback>{comment.author?.name?.[0] ?? 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <p className="text-sm font-medium">{comment.author?.name}</p>
          <p className="text-sm text-charcoal-700 dark:text-charcoal-300">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          <button onClick={handleLike} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-error-500 text-error-500')} />
            {likes > 0 && <span>{likes}</span>}
          </button>
          <button onClick={() => onReply(comment._id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <Reply className="h-3.5 w-3.5" />
            Reply
          </button>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        {replies.length > 0 && (
          <div className="mt-2 space-y-3">
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({ postId, comments, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment?.(newComment, replyTo);
      setNewComment('');
      setReplyTo(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Comments ({comments.length})</h3>

      {/* Add Comment */}
      <div className="flex gap-3">
        <div className="flex-1">
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background min-h-[80px] resize-none"
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="flex items-center justify-between mt-2">
            {replyTo && (
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(undefined)}>
                Cancel reply
              </Button>
            )}
            <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting} className="ml-auto" disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} onReply={setReplyTo} />
        ))}
      </div>
    </div>
  );
}
