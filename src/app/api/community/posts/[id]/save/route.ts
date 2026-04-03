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
    const hasSaved = post.savedBy?.some(id => id.toString() === userId);

    if (hasSaved) {
      // Unsave
      post.savedBy = post.savedBy.filter(id => id.toString() !== userId);
      post.saves = post.savedBy.length;
    } else {
      // Save
      if (!post.savedBy) {
        post.savedBy = [];
      }
      post.savedBy.push(userId as any);
      post.saves = post.savedBy.length;
    }

    await post.save();

    return NextResponse.json({
      saved: !hasSaved,
      saves: post.saves,
    });
  } catch (error) {
    console.error('Error toggling save:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}