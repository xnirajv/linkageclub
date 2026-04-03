import { NextResponse } from 'next/server';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const categories = await Post.aggregate([
      { $match: { isHidden: false, isDeleted: false } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        lastActivity: { $max: '$lastActivityAt' },
      }},
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}