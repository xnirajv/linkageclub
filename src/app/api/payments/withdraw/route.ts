import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Payment from '@/lib/db/models/payment';
import User from '@/lib/db/models/user';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { generateTransactionId } from '@/lib/utils/generateToken';
import mongoose from 'mongoose';

const withdrawSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal amount is ₹100'),
  method: z.enum(['bank', 'upi']),
  accountDetails: z.object({
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    accountHolderName: z.string().optional(),
    upiId: z.string().optional(),
  }),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = withdrawSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user with balance
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate available balance
    const payments = await Payment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          status: 'completed',
          type: { $in: ['project', 'mentorship'] },
        },
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: '$amount' },
        },
      },
    ]);

    const withdrawals = await Payment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          type: 'withdrawal',
          status: { $in: ['completed', 'pending'] },
        },
      },
      {
        $group: {
          _id: null,
          totalWithdrawn: { $sum: '$amount' },
          pendingWithdrawals: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    const totalEarned = payments[0]?.totalEarned || 0;
    const totalWithdrawn = withdrawals[0]?.totalWithdrawn || 0;
    const pendingWithdrawals = withdrawals[0]?.pendingWithdrawals || 0;
    const availableBalance = totalEarned - totalWithdrawn - pendingWithdrawals;

    // Check if user has sufficient balance
    if (validation.data.amount > availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Check daily withdrawal limit (₹50,000)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyWithdrawals = await Payment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          type: 'withdrawal',
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const dailyTotal = dailyWithdrawals[0]?.total || 0;
    const dailyLimit = 50000;

    if (dailyTotal + validation.data.amount > dailyLimit) {
      return NextResponse.json(
        { error: `Daily withdrawal limit of ₹${dailyLimit.toLocaleString()} exceeded` },
        { status: 400 }
      );
    }

    // Calculate fee (1% + ₹10, max ₹100)
    const feeAmount = Math.min(validation.data.amount * 0.01 + 10, 100);
    const netAmount = validation.data.amount - feeAmount;

    // Create withdrawal record
    const withdrawal = await Payment.create({
      transactionId: generateTransactionId(),
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'withdrawal',
      purpose: 'Withdrawal request',
      amount: validation.data.amount,
      currency: 'INR',
      status: 'pending',
      paymentMethod: {
        type: validation.data.method,
        details: validation.data.accountDetails,
      },
      // Use fees object (plural) as defined in the interface
      fees: {
        platformFee: feeAmount,
        tax: 0,
        total: feeAmount,
        netAmount: netAmount,
      },
      metadata: {
        requestedAt: new Date(),
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent'),
        fee: feeAmount, // Store fee in metadata as well if needed
        netAmount: netAmount,
      },
      notes: validation.data.notes,
    });

    // Create notification
    await Notification.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'withdrawal_initiated',
      title: 'Withdrawal Initiated',
      message: `Your withdrawal request for ₹${validation.data.amount.toLocaleString()} has been received and is being processed.`,
      data: {
        withdrawalId: withdrawal._id,
        amount: validation.data.amount,
        fee: feeAmount,
        netAmount,
      },
      category: 'payment',
      priority: 'medium',
    });

    // Notify admin for manual processing if amount is large
    if (validation.data.amount > 10000) {
      // Find admin users
      const admins = await User.find({ role: 'admin' }).select('_id');
      
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'withdrawal_review',
          title: 'Large Withdrawal Request',
          message: `User ${user.name} has requested a withdrawal of ₹${validation.data.amount.toLocaleString()}.`,
          data: {
            withdrawalId: withdrawal._id,
            userId: session.user.id,
            amount: validation.data.amount,
          },
          category: 'payment',
          priority: 'high',
        });
      }
    }

    // For small amounts, auto-process via Razorpay (if configured)
    if (validation.data.amount <= 10000 && process.env.RAZORPAY_KEY_ID) {
      try {
        // This would integrate with Razorpay's payout API
        // const transfer = await createTransfer({
        //   accountNumber: validation.data.accountDetails.accountNumber,
        //   amount: netAmount,
        //   notes: { withdrawalId: withdrawal._id },
        // });

        // Mark as processing
        withdrawal.status = 'processing';
        await withdrawal.save();

        // Update notification
        await Notification.create({
          userId: new mongoose.Types.ObjectId(session.user.id),
          type: 'withdrawal_processing',
          title: 'Withdrawal Processing',
          message: `Your withdrawal is being processed and should be completed within 24 hours.`,
          data: {
            withdrawalId: withdrawal._id,
          },
          category: 'payment',
        });
      } catch (error) {
        console.error('Auto-processing failed:', error);
        // Leave as pending for manual processing
      }
    }

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        fee: feeAmount,
        netAmount,
        status: withdrawal.status,
        requestedAt: withdrawal.createdAt,
      },
      balance: {
        available: availableBalance - validation.data.amount,
        pending: pendingWithdrawals + validation.data.amount,
        total: totalEarned,
      },
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get withdrawal history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const query: any = {
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'withdrawal',
    };

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const withdrawals = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit) as any[];

    const total = await Payment.countDocuments(query);

    // Calculate statistics
    const stats = await Payment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          type: 'withdrawal',
        },
      },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          totalFees: { $sum: '$fees.total' },
        },
      },
    ]);

    const formattedStats = stats.reduce((acc: any, stat) => {
      acc[stat._id] = {
        total: stat.total,
        count: stat.count,
        fees: stat.totalFees,
      };
      return acc;
    }, {});

    // Get pending total
    const pendingTotal = withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);

    // Format withdrawals for response
    const formattedWithdrawals = withdrawals.map(w => ({
      id: w._id,
      amount: w.amount,
      fee: w.fees?.total || 0,
      netAmount: w.fees?.netAmount || w.amount,
      status: w.status,
      method: w.paymentMethod?.type,
      requestedAt: w.createdAt,
      processedAt: w.metadata?.processedAt || w.metadata?.completedAt,
      transactionId: w.metadata?.transactionId,
    }));

    return NextResponse.json({
      withdrawals: formattedWithdrawals,
      stats: formattedStats,
      pendingTotal,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel withdrawal request
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const withdrawalId = searchParams.get('id');

    if (!withdrawalId) {
      return NextResponse.json(
        { error: 'Withdrawal ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const withdrawal = await Payment.findOne({
      _id: withdrawalId,
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'withdrawal',
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending withdrawals can be cancelled' },
        { status: 400 }
      );
    }

    withdrawal.status = 'cancelled';
    withdrawal.metadata = {
      ...withdrawal.metadata,
      cancelledAt: new Date(),
      cancelledBy: session.user.id,
    };
    await withdrawal.save();

    // Create notification
    await Notification.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'withdrawal_cancelled',
      title: 'Withdrawal Cancelled',
      message: `Your withdrawal request for ₹${withdrawal.amount.toLocaleString()} has been cancelled.`,
      data: {
        withdrawalId: withdrawal._id,
        amount: withdrawal.amount,
      },
      category: 'payment',
    });

    return NextResponse.json({
      message: 'Withdrawal cancelled successfully',
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    console.error('Error cancelling withdrawal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint to process withdrawals
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { withdrawalId, action, transactionId, notes } = body;

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const withdrawal = await Payment.findById(withdrawalId).populate('userId') as any;

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    if (withdrawal.type !== 'withdrawal') {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      withdrawal.status = 'processing';
      withdrawal.metadata = {
        ...withdrawal.metadata,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        notes,
      };
    } else if (action === 'complete') {
      withdrawal.status = 'completed';
      
      // Store processing info in metadata (since processedAt doesn't exist directly)
      withdrawal.metadata = {
        ...withdrawal.metadata,
        processedAt: new Date(),
        processedBy: session.user.id,
        transactionId,
        completedAt: new Date(),
        notes,
      };

      // Send success notification to user
      await Notification.create({
        userId: withdrawal.userId._id,
        type: 'withdrawal_completed',
        title: 'Withdrawal Completed',
        message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString()} has been processed successfully.`,
        data: {
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
          transactionId,
        },
        category: 'payment',
        priority: 'high',
      });
    } else if (action === 'reject') {
      withdrawal.status = 'failed';
      withdrawal.metadata = {
        ...withdrawal.metadata,
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
        notes,
      };

      // Send failure notification to user
      await Notification.create({
        userId: withdrawal.userId._id,
        type: 'withdrawal_failed',
        title: 'Withdrawal Failed',
        message: `Your withdrawal request for ₹${withdrawal.amount.toLocaleString()} could not be processed. Please contact support.`,
        data: {
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
          reason: notes,
        },
        category: 'payment',
        priority: 'high',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await withdrawal.save();

    return NextResponse.json({
      message: `Withdrawal ${action}ed successfully`,
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        processedAt: withdrawal.metadata?.processedAt,
      },
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}