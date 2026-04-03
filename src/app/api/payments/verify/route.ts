import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import crypto from 'crypto';
import Payment from '@/lib/db/models/payment';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
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
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

    // Verify signature
    const bodyText = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(bodyText.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find payment by order ID
    const payment = await Payment.findOne({ 'gateway.orderId': razorpay_order_id });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    payment.status = 'completed';
    payment.gateway.paymentId = razorpay_payment_id;
    payment.gateway.signature = razorpay_signature;
    await payment.save();

    // Handle post-payment actions based on type
    switch (payment.type) {
      case 'assessment':
        // No additional action needed, assessment will be unlocked when started
        break;

      case 'mentorship':
        // Update mentor session payment status
        if (payment.sessionId) {
          const mentor = await Mentor.findOne({ userId: payment.recipientId });
          if (mentor) {
            const sessionIndex = mentor.sessions.findIndex(
              (s: any) => s._id.toString() === payment.sessionId?.toString()
            );
            if (sessionIndex !== -1) {
              mentor.sessions[sessionIndex].paymentStatus = 'paid';
              await mentor.save();
            }
          }
        }
        break;

      case 'project':
        // Update project milestone payment status or create escrow
        if (payment.projectId) {
          // Handle project payment logic
        }
        break;

      case 'subscription':
        // Update user subscription
        await User.findByIdAndUpdate(payment.userId, {
          'subscription.plan': payment.planId,
          'subscription.active': true,
          'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
        break;
    }

    return NextResponse.json({
      message: 'Payment verified successfully',
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}