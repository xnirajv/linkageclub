import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Payment from '@/lib/db/models/payment';
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

    // Calculate earnings from completed payments
    const earnings = await Payment.aggregate([
      {
        $match: {
          recipientId: session.user.id,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: '$amount' },
          thisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    '$createdAt',
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  ],
                },
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
                    {
                      $gte: [
                        '$createdAt',
                        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                      ],
                    },
                    {
                      $lt: [
                        '$createdAt',
                        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                      ],
                    },
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

    // Calculate withdrawals
    const withdrawals = await Payment.aggregate([
      {
        $match: {
          userId: session.user.id,
          type: 'withdrawal',
          status: { $in: ['completed', 'pending'] },
        },
      },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const completedWithdrawals = withdrawals.find(w => w._id === 'completed')?.total || 0;
    const pendingWithdrawals = withdrawals.find(w => w._id === 'pending')?.total || 0;

    // Calculate pending payouts
    const pendingPayouts = await Payment.aggregate([
      {
        $match: {
          recipientId: session.user.id,
          status: 'pending',
          type: { $in: ['project', 'mentorship'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalEarned = earnings[0]?.totalEarned || 0;
    const availableBalance = totalEarned - completedWithdrawals;

    return NextResponse.json({
      balance: {
        totalEarned,
        available: availableBalance,
        pending: pendingPayouts[0]?.total || 0,
        withdrawn: completedWithdrawals,
        pendingWithdrawals,
      },
      monthly: {
        thisMonth: earnings[0]?.thisMonth || 0,
        lastMonth: earnings[0]?.lastMonth || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}