import { NextResponse } from 'next/server';
import { Post } from '@/lib/db/models/community';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const stats = await Post.aggregate([
      { $match: { isHidden: false, isDeleted: false } },
      {
        $facet: {
          totalPosts: [{ $count: 'count' }],
          totalComments: [
            {
              $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'postId',
                as: 'postComments',
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: { $size: '$postComments' } },
              },
            },
          ],
          totalLikes: [{ $group: { _id: null, total: { $sum: '$likes' } } }],
          totalViews: [{ $group: { _id: null, total: { $sum: '$views' } } }],
          activeUsers: [
            {
              $group: {
                _id: '$authorId',
                count: { $sum: 1 },
              },
            },
            { $count: 'count' },
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    const result = {
      totalPosts: stats[0].totalPosts[0]?.count || 0,
      totalComments: stats[0].totalComments[0]?.count || 0,
      totalLikes: stats[0].totalLikes[0]?.total || 0,
      totalViews: stats[0].totalViews[0]?.total || 0,
      activeUsers: stats[0].activeUsers[0]?.count || 0,
      byType: stats[0].byType,
      byCategory: stats[0].byCategory,
    };

    return NextResponse.json({ stats: result });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}