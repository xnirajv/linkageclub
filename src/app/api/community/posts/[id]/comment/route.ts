import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Post, Comment } from '@/lib/db/models/community';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000, 'Comment is too long'),
  parentId: z.string().optional(),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video', 'link']),
    thumbnail: z.string().url().optional(),
  })).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if post exists
    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if post is locked
    if (post.isLocked) {
      return NextResponse.json(
        { error: 'This post is locked and cannot accept new comments' },
        { status: 403 }
      );
    }

    // Check if post is hidden or deleted
    if (post.isHidden || post.isDeleted) {
      return NextResponse.json(
        { error: 'Cannot comment on hidden or deleted posts' },
        { status: 403 }
      );
    }

    // If parentId is provided, check if parent comment exists
    if (validation.data.parentId) {
      const parentComment = await Comment.findById(validation.data.parentId);
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create comment
    const comment = await Comment.create({
      postId: params.id,
      authorId: session.user.id,
      parentId: validation.data.parentId,
      content: validation.data.content,
      media: validation.data.media || [],
      likes: 0,
      likedBy: [],
      replies: 0,
      isHidden: false,
      isDeleted: false,
    });

    // Update post comment count and last activity
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

    // Populate author details
    await comment.populate('authorId', 'name avatar trustScore');

    // Create notifications
    const notifications: Array<PromiseLike<unknown>> = [];

    // Notify post author (if not commenting on own post)
    if (post.authorId.toString() !== session.user.id) {
      notifications.push(
        Notification.create({
          userId: post.authorId,
          type: 'new_comment',
          title: 'New comment on your post',
          message: `${session.user.name} commented on your post`,
          data: {
            postId: post._id,
            commentId: comment._id,
            commenterId: session.user.id,
            commenterName: session.user.name,
          },
          link: `/community/post/${post._id}`,
          category: 'community',
          priority: 'medium',
        })
      );
    }

    // If replying to a comment, notify the comment author
    if (validation.data.parentId) {
      const parentComment = await Comment.findById(validation.data.parentId);
      if (parentComment && parentComment.authorId.toString() !== session.user.id) {
        notifications.push(
          Notification.create({
            userId: parentComment.authorId,
            type: 'comment_reply',
            title: 'Someone replied to your comment',
            message: `${session.user.name} replied to your comment`,
            data: {
              postId: post._id,
              commentId: comment._id,
              parentCommentId: validation.data.parentId,
              replierId: session.user.id,
              replierName: session.user.name,
            },
            link: `/community/post/${post._id}`,
            category: 'community',
            priority: 'medium',
          })
        );
      }
    }

    // Notify mentioned users (if any)
    const mentions = validation.data.content.match(/@[a-zA-Z0-9_]+/g) || [];
    if (mentions.length > 0) {
      // This would require a user search by username
      // For now, we'll skip mention notifications
    }

    await Promise.all(notifications);

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

// Get comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'latest'; // latest, popular
    const parentId = searchParams.get('parentId'); // null for top-level comments

    const query: any = {
      postId: params.id,
      isHidden: false,
      isDeleted: false,
    };

    if (parentId === 'null' || parentId === null) {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }

    let sortQuery: any = {};
    switch (sort) {
      case 'popular':
        sortQuery = { likes: -1, replies: -1, createdAt: -1 };
        break;
      case 'latest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    const comments = await Comment.find(query)
      .populate('authorId', 'name avatar trustScore')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(query);

    // Create a new array with like status
    let commentsWithLikeStatus: any[] = [];

    if (session) {
      // Convert each comment to object and add isLiked property
      commentsWithLikeStatus = comments.map(comment => {
        const commentObj = comment.toObject();
        
        // Check if user liked this comment
        const likedBy = comment.likedBy || [];
        const isLiked = likedBy.some((id: any) => id?.toString() === session.user.id);
        
        return {
          ...commentObj,
          isLiked
        };
      });
    } else {
      // No session, just convert to objects without like status
      commentsWithLikeStatus = comments.map(comment => comment.toObject());
    }

    return NextResponse.json({
      comments: commentsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a comment
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { content, media } = body;

    if (!content && !media) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    await connectDB();

    const comment = await Comment.findById(params.id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user owns the comment or is admin
    if (comment.authorId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if comment is deleted
    if (comment.isDeleted) {
      return NextResponse.json(
        { error: 'Cannot update deleted comment' },
        { status: 403 }
      );
    }

    const updates: any = {};
    if (content) updates.content = content;
    if (media) updates.media = media;

    const updatedComment = await Comment.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true }
    ).populate('authorId', 'name avatar trustScore');

    return NextResponse.json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const comment = await Comment.findById(params.id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user owns the comment or is admin
    if (comment.authorId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    // Update post comment count
    await Post.findByIdAndUpdate(
      comment.postId,
      { $inc: { comments: -1 } }
    );

    // If this was a reply, update parent comment's reply count
    if (comment.parentId) {
      await Comment.findByIdAndUpdate(
        comment.parentId,
        { $inc: { replies: -1 } }
      );
    }

    return NextResponse.json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
