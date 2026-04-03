import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const reportedPosts = await Post.find({
      reportCount: { $gt: 0 },
      isHidden: false,
      isDeleted: false,
    })
      .populate('authorId', 'name email')
      .populate('reportedBy.userId', 'name email')
      .sort({ reportCount: -1, createdAt: -1 });

    return NextResponse.json({ posts: reportedPosts });
  } catch (error) {
    console.error('Error fetching reported posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { postId, action } = body;

    await connectDB();

    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (action === 'hide') {
      post.isHidden = true;
    } else if (action === 'show') {
      post.isHidden = false;
    } else if (action === 'clear-reports') {
      post.reportedBy = [];
      post.reportCount = 0;
    }

    await post.save();

    return NextResponse.json({
      message: `Post ${action} successfully`,
    });
  } catch (error) {
    console.error('Error moderating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}