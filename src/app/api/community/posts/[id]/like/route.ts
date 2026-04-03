import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Post } from '@/lib/db/models/community';
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

    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const hasLiked = post.likedBy?.some(id => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
      post.likes = post.likedBy.length;
    } else {
      // Like
      if (!post.likedBy) {
        post.likedBy = [];
      }
      post.likedBy.push(userId as any);
      post.likes = post.likedBy.length;
    }

    await post.save();

    return NextResponse.json({
      liked: !hasLiked,
      likes: post.likes,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}