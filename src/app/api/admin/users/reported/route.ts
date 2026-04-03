import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
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

    // Get users with reported content
    const reportedUsers = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'authorId',
          as: 'posts',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'authorId',
          as: 'comments',
        },
      },
      {
        $addFields: {
          reportedPosts: {
            $filter: {
              input: '$posts',
              as: 'post',
              cond: { $gt: ['$$post.reportCount', 0] },
            },
          },
          reportedComments: {
            $filter: {
              input: '$comments',
              as: 'comment',
              cond: { $gt: ['$$comment.reportCount', 0] },
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { reportedPosts: { $ne: [] } },
            { reportedComments: { $ne: [] } },
          ],
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          avatar: 1,
          reportedPosts: 1,
          reportedComments: 1,
          totalReports: {
            $add: [
              { $sum: '$reportedPosts.reportCount' },
              { $sum: '$reportedComments.reportCount' },
            ],
          },
        },
      },
      { $sort: { totalReports: -1 } },
    ]);

    return NextResponse.json({ users: reportedUsers });
  } catch (error) {
    console.error('Error fetching reported users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}