import { NextResponse } from 'next/server';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const tags = await Post.aggregate([
      { $match: { isHidden: false, isDeleted: false } },
      { $unwind: '$tags' },
      { $group: {
        _id: '$tags',
        count: { $sum: 1 },
      }},
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}