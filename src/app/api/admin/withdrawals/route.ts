import { NextRequest, NextResponse } from 'next/server';
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

    const pendingWithdrawals = await Payment.find({
      type: 'withdrawal',
      status: 'pending',
    })
      .populate('userId', 'name email bankDetails')
      .sort({ createdAt: -1 });

    const processedWithdrawals = await Payment.find({
      type: 'withdrawal',
      status: { $in: ['completed', 'failed'] },
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: { type: 'withdrawal', status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return NextResponse.json({
      pending: pendingWithdrawals,
      processed: processedWithdrawals,
      totalPending: totals[0]?.total || 0,
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { withdrawalId, action, notes } = body;

    await connectDB();

    const withdrawal = await Payment.findById(withdrawalId);

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      withdrawal.status = 'completed';
      withdrawal.metadata = {
        ...withdrawal.metadata,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        notes,
      };
    } else if (action === 'reject') {
      withdrawal.status = 'failed';
      withdrawal.metadata = {
        ...withdrawal.metadata,
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
        notes,
      };
    }

    await withdrawal.save();

    return NextResponse.json({
      message: `Withdrawal ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}