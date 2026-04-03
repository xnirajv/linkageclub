import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.id !== params.id && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all'; // day, week, month, year, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get mentor for stats
    const mentor = await Mentor.findOne({ userId: params.id });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Get payments
    let dateFilter = {};
    const now = new Date();

    if (period === 'day') {
      dateFilter = {
        createdAt: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999)),
        },
      };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: yearAgo } };
    }

    const payments = await Payment.find({
      recipientId: params.id,
      type: 'mentorship',
      status: 'completed',
      ...dateFilter,
    })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments({
      recipientId: params.id,
      type: 'mentorship',
      status: 'completed',
      ...dateFilter,
    });

    // Calculate earnings summary
    const earnings = await Payment.aggregate([
      {
        $match: {
          recipientId: mentor.userId,
          type: 'mentorship',
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          totalSessions: { $sum: 1 },
          averagePerSession: { $avg: '$amount' },
          thisMonth: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(now.getFullYear(), now.getMonth(), 1)] },
                '$amount',
                0,
              ],
            },
          },
          lastMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', new Date(now.getFullYear(), now.getMonth() - 1, 1)] },
                    { $lt: ['$createdAt', new Date(now.getFullYear(), now.getMonth(), 1)] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      earnings: earnings[0] || {
        totalEarnings: 0,
        totalSessions: 0,
        averagePerSession: 0,
        thisMonth: 0,
        lastMonth: 0,
      },
      transactions: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}