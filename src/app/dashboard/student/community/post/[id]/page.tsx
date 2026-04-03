'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePost } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { formatRelativeTime } from '@/lib/utils/format';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  ThumbsUp,
  Link as LinkIcon,
  BarChart3,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
interface PollOption {
  _id: string;
  text: string;
  votes?: number;
  voters?: string[];
}
interface Author {
  _id: string;
  name: string;
  avatar?: string;
}

interface Comment {
  _id: string;
  content: string;
  author?: Author;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth() as { user: { id: string; name: string; image?: string } | null };
  
  // ✅ Fix 1: Remove likePost and savePost from destructuring (they don't exist)
  const { 
    post, 
    comments = [], 
    isLoading, 
    addComment, 
    likeComment 
  } = usePost(params.id as string);
  
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showPollResults, setShowPollResults] = useState(false);
  const [selectedPollOptions, setSelectedPollOptions] = useState<string[]>([]);

  // Manual like/save handlers
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [isSaved, setIsSaved] = useState(post?.isSaved || false);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
    );
  }

  if (!post) {
    return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-charcoal-950">Post not found</h2>
          <p className="text-charcoal-600 mt-2">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/dashboard/student/community')} className="mt-4">
            Go to Community
          </Button>
        </div>
    );
  }

  const isAuthor = user?.id === post.authorId?._id;
  const hasVoted = post.poll?.options?.some((opt: PollOption) => opt.voters?.includes(user?.id || ''));

  // ✅ Fix 2: Manual like handler
  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount((prev: number) => isLiked ? prev - 1 : prev + 1);
    // API call would go here
    console.log('Like post:', post._id);
  };

  // ✅ Fix 3: Manual save handler
  const handleSave = async () => {
    setIsSaved(!isSaved);
    // API call would go here
    console.log('Save post:', post._id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
  };

  const handleReport = () => {
    console.log('Report post');
  };

  // ✅ Fix 4: Fixed addComment call - only 2 arguments
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addComment(commentText, replyTo || undefined);
      setCommentText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePollVote = (optionId: string) => {
    if (post.poll?.allowMultiple) {
      setSelectedPollOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedPollOptions([optionId]);
    }
  };

  const handleSubmitPollVote = async () => {
    console.log('Submit poll votes:', selectedPollOptions);
  };

  const renderPoll = () => {
    const totalVotes = post.poll?.options?.reduce((sum: number, opt: PollOption) => sum + (opt.votes || 0), 0) || 0;

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{post.poll?.question}</h3>
        
        <div className="space-y-3">
          {post.poll?.options?.map((option: PollOption) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes || 0) / totalVotes * 100) : 0;
            
            return (
              <div key={option._id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{option.text}</span>
                  {showPollResults && (
                    <span className="text-charcoal-600">{option.votes || 0} votes ({percentage}%)</span>
                  )}
                </div>
                
                {!showPollResults && !hasVoted ? (
                  <button
                    onClick={() => handlePollVote(option._id)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      selectedPollOptions.includes(option._id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'hover:border-charcoal-400'
                    }`}
                  >
                    {option.text}
                  </button>
                ) : (
                  <div className="relative h-8 bg-charcoal-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary-100"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3 text-sm">
                      {option.text} {showPollResults && `(${percentage}%)`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!showPollResults && !hasVoted && (
          <div className="flex gap-2">
            <Button onClick={handleSubmitPollVote} disabled={selectedPollOptions.length === 0}>
              Vote
            </Button>
            <Button variant="ghost" onClick={() => setShowPollResults(true)}>
              View Results
            </Button>
          </div>
        )}

        {(showPollResults || hasVoted) && (
          <div className="flex items-center gap-2 text-sm text-charcoal-500">
            <BarChart3 className="h-4 w-4" />
            <span>{totalVotes} votes • Poll ends {post.poll?.expiresAt ? new Date(post.poll.expiresAt).toLocaleDateString() : 'never'}</span>
          </div>
        )}
      </div>
    );
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment._id} className={`${depth > 0 ? 'ml-12 mt-3' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author?.avatar} />
          <AvatarFallback>{comment.author?.name?.[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-charcoal-100/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.author?.name}</span>
              <span className="text-xs text-charcoal-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-charcoal-900">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => likeComment(comment._id)}
              className="flex items-center gap-1 text-xs text-charcoal-500 hover:text-primary-600"
            >
              <ThumbsUp className={`h-3 w-3 ${comment.isLiked ? 'fill-primary-600 text-primary-600' : ''}`} />
              {comment.likes || 0}
            </button>
            <button
              onClick={() => setReplyTo(comment._id)}
              className="text-xs text-charcoal-500 hover:text-primary-600"
            >
              Reply
            </button>
          </div>

          {comment.replies?.map((reply: Comment) => renderComment(reply, depth + 1))}
        </div>
      </div>
    </div>
  );

  return (
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard/student/community">Community</Link>
          </Button>
          <span className="text-charcoal-400">/</span>
          <span className="text-charcoal-600">Post</span>
        </div>

        {/* Main Post */}
        <Card className="p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href={`/profile/${post.authorId?._id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.authorId?.avatar} />
                  <AvatarFallback>{post.authorId?.name?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link href={`/profile/${post.authorId?._id}`} className="font-medium hover:underline">
                  {post.authorId?.name}
                </Link>
                <div className="flex items-center gap-2 text-xs text-charcoal-500">
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  <span>•</span>
                  <Badge variant="skill" size="sm">{post.category}</Badge>
                  <span>•</span>
                  <Badge variant="skill" size="sm">{post.type}</Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {isAuthor && (
                  <>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post Title */}
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {/* Post Content */}
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Poll */}
          {post.type === 'poll' && post.poll && (
            <div className="mt-6 p-4 bg-charcoal-100/50 rounded-lg">
              {renderPoll()}
            </div>
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {post.media.map((item: any, index: number) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  {item.type === 'image' && (
                    <img src={item.url} alt="" className="w-full h-48 object-cover" />
                  )}
                  {item.type === 'video' && (
                    <video src={item.url} controls className="w-full h-48 object-cover" />
                  )}
                  {item.type === 'link' && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-charcoal-100 hover:bg-charcoal-100 transition-colors"
                    >
                      <LinkIcon className="h-5 w-5 mb-2" />
                      <span className="text-sm break-all">{item.url}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="skill" size="sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Stats */}
          <div className="mt-6 flex items-center gap-6 text-sm text-charcoal-500">
            <span>{post.views} views</span>
            <span>{likeCount} likes</span>
            <span>{post.comments} comments</span>
            <span>{post.shares} shares</span>
          </div>

          {/* Post Actions */}
          <div className="mt-6 flex items-center gap-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-primary-600' : ''}
            >
              <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={isSaved ? 'text-primary-600' : ''}
            >
              <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              Save
            </Button>
          </div>
        </Card>

        {/* Comment Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          
          {replyTo && (
            <div className="mb-4 p-3 bg-charcoal-100/50 rounded-lg flex items-center justify-between">
              <span className="text-sm">Replying to comment</span>
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image} />
              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
            </div>
            <Button onClick={handleSubmitComment} disabled={!commentText.trim()} isLoading={isSubmittingComment}>
              Post
            </Button>
          </div>
        </Card>

        {/* Comments List */}
        {comments && comments.length > 0 && (
          <Card className="p-6">
            <div className="space-y-6">
              {comments.map((comment: Comment) => renderComment(comment))}
            </div>
          </Card>
        )}
      </div>
  );
}