import { NextResponse } from 'next/server';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const posts = await Post.find({
      createdAt: { $gte: weekAgo },
      isHidden: false,
      isDeleted: false,
    })
      .populate('authorId', 'name avatar')
      .sort({ likes: -1, comments: -1, views: -1 })
      .limit(10);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}