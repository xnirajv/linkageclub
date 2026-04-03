import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Comment } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function POST(
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

    const userId = session.user.id;
    const hasLiked = comment.likedBy?.some(id => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
      comment.likes = comment.likedBy.length;
    } else {
      // Like
      if (!comment.likedBy) {
        comment.likedBy = [];
      }
      comment.likedBy.push(userId as any);
      comment.likes = comment.likedBy.length;
    }

    await comment.save();

    return NextResponse.json({
      liked: !hasLiked,
      likes: comment.likes,
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}