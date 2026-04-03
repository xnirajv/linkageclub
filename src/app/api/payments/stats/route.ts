import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Payment from '@/lib/db/models/payment';
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

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const stats = await Payment.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
                platformFees: { $sum: '$fees.platformFee' },
                taxes: { $sum: '$fees.tax' },
                netRevenue: { $sum: '$fees.netAmount' },
              },
            },
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                total: { $sum: '$amount' },
              },
            },
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                total: { $sum: '$amount' },
              },
            },
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' },
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 },
          ],
          thisMonth: [
            {
              $match: {
                createdAt: { $gte: firstDayOfMonth },
              },
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: '$amount' },
                transactions: { $sum: 1 },
              },
            },
          ],
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: firstDayOfLastMonth,
                  $lte: lastDayOfLastMonth,
                },
              },
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: '$amount' },
                transactions: { $sum: 1 },
              },
            },
          ],
          popularMethods: [
            {
              $group: {
                _id: '$paymentMethod.type',
                count: { $sum: 1 },
                total: { $sum: '$amount' },
              },
            },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]);

    const result = {
      overview: stats[0].overview[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        platformFees: 0,
        taxes: 0,
        netRevenue: 0,
      },
      byType: stats[0].byType,
      byStatus: stats[0].byStatus,
      byMonth: stats[0].byMonth,
      thisMonth: stats[0].thisMonth[0] || { revenue: 0, transactions: 0 },
      lastMonth: stats[0].lastMonth[0] || { revenue: 0, transactions: 0 },
      popularMethods: stats[0].popularMethods,
    };

    return NextResponse.json({ stats: result });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}