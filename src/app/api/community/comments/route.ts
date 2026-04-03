import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Comment, Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const commentSchema = z.object({
  postId: z.string(),
  parentId: z.string().optional(),
  content: z.string().min(1),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video', 'link']),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = commentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if post exists and is not hidden/deleted
    const post = await Post.findById(validation.data.postId);
    if (!post || post.isHidden || post.isDeleted) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.isLocked) {
      return NextResponse.json(
        { error: 'This post is locked and cannot accept new comments' },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      ...validation.data,
      authorId: session.user.id,
      likes: 0,
      likedBy: [],
      replies: 0,
    });

    // Update post comment count
    post.comments += 1;
    post.lastActivityAt = new Date();
    await post.save();

    // If this is a reply, update parent comment's reply count
    if (validation.data.parentId) {
      await Comment.findByIdAndUpdate(
        validation.data.parentId,
        { $inc: { replies: 1 } }
      );
    }

    await comment.populate('authorId', 'name avatar');

    return NextResponse.json({
      message: 'Comment added successfully',
      comment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}