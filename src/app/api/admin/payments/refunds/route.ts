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

    const pendingRefunds = await Payment.find({
      'refund.status': 'pending',
    })
      .populate('userId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ 'refund.requestedAt': -1 });

    const processedRefunds = await Payment.find({
      'refund.status': { $in: ['approved', 'rejected', 'processed'] },
    })
      .populate('userId', 'name email')
      .populate('recipientId', 'name email')
      .sort({ 'refund.processedAt': -1 })
      .limit(50);

    return NextResponse.json({
      pending: pendingRefunds,
      recent: processedRefunds,
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}