'use client';

import React from 'react';
import { Post } from '@/types/community';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LikeButton } from './LikeButton';
import { Button } from '@/components/ui/button';
import { MessageCircle, Share2, Bookmark, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const TYPE_COLORS: Record<string, any> = {
  discussion: 'outline',
  question: 'warning',
  showcase: 'success',
  poll: 'secondary',
  announcement: 'default',
};

export function PostCard({ post, onLike, onSave, onShare }: PostCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        {/* Author */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.author?.avatar} />
            <AvatarFallback>{post.author?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{post.author?.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          <Badge variant={TYPE_COLORS[post.type] || 'outline'} size="sm" className="capitalize">
            {post.type}
          </Badge>
        </div>

        {/* Content */}
        <Link href={`/dashboard/student/community/post/${post._id}`}>
          <h3 className="font-semibold text-charcoal-950 dark:text-white hover:text-primary-600 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="skill" size="sm">#{tag}</Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-5 py-3 border-t flex items-center gap-4">
        <LikeButton postId={post._id} likes={post.likes} isLiked={post.isLiked} onLike={onLike} />

        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground">
          <Link href={`/dashboard/student/community/post/${post._id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comments}</span>
          </Link>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => onShare?.(post._id)}>
          <Share2 className="h-4 w-4" />
          <span className="text-xs">{post.shares}</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => onSave?.(post._id)}>
          <Bookmark className={`h-4 w-4 ${post.isSaved ? 'fill-primary-600 text-primary-600' : ''}`} />
        </Button>

        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {post.views}
        </div>
      </CardFooter>
    </Card>
  );
}
