import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const stats = await Application.aggregate([
      {
        $match: {
          $or: [
            { applicantId: session.user.id },
            { companyId: session.user.id },
          ],
        },
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: {
              _id: '$status',
              count: { $sum: 1 },
            }},
          ],
          byType: [
            { $group: {
              _id: '$type',
              count: { $sum: 1 },
            }},
          ],
          recent: [
            { $sort: { submittedAt: -1 } },
            { $limit: 5 },
            { $project: {
              type: 1,
              status: 1,
              submittedAt: 1,
            }},
          ],
        },
      },
    ]);

    const result = {
      total: stats[0].total[0]?.count || 0,
      byStatus: stats[0].byStatus,
      byType: stats[0].byType,
      recent: stats[0].recent,
    };

    return NextResponse.json({ stats: result });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}