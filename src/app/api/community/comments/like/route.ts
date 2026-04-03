import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Comment } from '@/lib/db/models/community';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

// Define interfaces for better type safety
interface IComment {
  _id: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  authorId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  content: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[] | string[];
  createdAt: Date;
}

interface LikeStatus {
  likes: number;
  isLiked: boolean;
}

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
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const comment = await Comment.findById(commentId)
      .populate('authorId', 'name email') as IComment | null;

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    
    // Ensure likedBy is an array
    const likedByArray = comment.likedBy || [];
    
    // Check if user has already liked - convert both to strings for comparison
    const hasLiked = likedByArray.some((id: any) => id?.toString() === userId);

    if (hasLiked) {
      // Unlike - filter out the user by string comparison
      if (comment.likedBy && comment.likedBy.length > 0) {
        // Check the type of the first element to determine the format
        const firstItem = comment.likedBy[0];
        const isObjectId = firstItem && typeof firstItem === 'object' && 'toString' in firstItem;
        
        if (isObjectId) {
          // Handle as ObjectId[] - filter by converting to string for comparison
          comment.likedBy = (comment.likedBy as mongoose.Types.ObjectId[])
            .filter((id: mongoose.Types.ObjectId) => id.toString() !== userId);
        } else {
          // Handle as string[] - filter directly
          comment.likedBy = (comment.likedBy as string[])
            .filter((id: string) => id !== userId);
        }
      } else {
        comment.likedBy = [];
      }
      
      comment.likes = Math.max(0, (comment.likes || 0) - 1);
      

      return NextResponse.json({
        liked: false,
        likes: comment.likes,
        message: 'Comment unliked successfully'
      });
    } else {
      // Like
      if (!comment.likedBy) {
        comment.likedBy = [];
      }
      
      // Add user to likedBy based on the existing type
      if (comment.likedBy.length > 0) {
        const firstItem = comment.likedBy[0];
        const isObjectId = firstItem && typeof firstItem === 'object' && 'toString' in firstItem;
        
        if (isObjectId) {
          // Add as ObjectId
          (comment.likedBy as mongoose.Types.ObjectId[]).push(new mongoose.Types.ObjectId(userId));
        } else {
          // Add as string
          (comment.likedBy as string[]).push(userId);
        }
      } else {
        // No existing items, default to string[] (or change based on your preference)
        comment.likedBy = [userId];
      }
      
      comment.likes = (comment.likes || 0) + 1;

      // Create notification for comment author (if not liking own comment)
      const authorId = comment.authorId?._id?.toString();
      if (authorId && authorId !== userId) {
        await Notification.create({
          userId: comment.authorId?._id,
          type: 'comment_like',
          title: 'Someone liked your comment',
          message: `${session.user.name} liked your comment`,
          data: {
            commentId: comment._id,
            postId: comment.postId,
            likerId: userId,
            likerName: session.user.name,
          },
          link: `/community/post/${comment.postId}`,
          category: 'community',
          priority: 'low',
        });
      }

      return NextResponse.json({
        liked: true,
        likes: comment.likes,
        message: 'Comment liked successfully'
      });
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get like status for multiple comments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const commentIds = searchParams.get('commentIds')?.split(',');

    if (!commentIds || commentIds.length === 0) {
      return NextResponse.json(
        { error: 'Comment IDs are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const comments = await Comment.find({
      _id: { $in: commentIds }
    }).select('likes likedBy');

    // Fix: Convert ObjectId to string when using as object key
    const likeStatus = comments.reduce((acc: Record<string, LikeStatus>, comment: any) => {
      // Convert _id to string for use as object key
      const commentIdStr = comment._id.toString();
      
      // Handle both ObjectId[] and string[] for likedBy
      const likedBy = comment.likedBy || [];
      const isLiked = likedBy.some((id: any) => id?.toString() === session.user.id);
      
      acc[commentIdStr] = {
        likes: comment.likes || 0,
        isLiked
      };
      return acc;
    }, {});

    return NextResponse.json({ likeStatus });
  } catch (error) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get users who liked a comment
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { commentId, page = 1, limit = 20 } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const comment = await Comment.findById(commentId)
      .populate({
        path: 'likedBy',
        select: 'name avatar trustScore',
        options: {
          skip: (page - 1) * limit,
          limit: limit
        }
      });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const total = comment.likedBy?.length || 0;

    return NextResponse.json({
      users: comment.likedBy || [],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users who liked comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Batch like/unlike comments
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { commentIds, action } = body; // action: 'like' or 'unlike'

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json(
        { error: 'Comment IDs are required' },
        { status: 400 }
      );
    }

    if (!['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = session.user.id;
    let updateResult;

    if (action === 'like') {
      // Add user to likedBy for all comments
      updateResult = await Comment.updateMany(
        { 
          _id: { $in: commentIds },
          likedBy: { $ne: userId }
        },
        {
          $addToSet: { likedBy: userId },
          $inc: { likes: 1 }
        }
      );
    } else {
      // Remove user from likedBy for all comments
      updateResult = await Comment.updateMany(
        { _id: { $in: commentIds } },
        {
          $pull: { likedBy: userId },
          $inc: { likes: -1 }
        }
      );
    }

    return NextResponse.json({
      message: `Successfully ${action}d ${updateResult.modifiedCount} comments`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (error) {
    console.error('Error batch updating comment likes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}