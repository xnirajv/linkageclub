import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const refundSchema = z.object({
  reason: z.string().min(5),
  amount: z.number().optional(), // If not provided, full refund
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can process refunds' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const payment = await Payment.findById(params.id) as any;

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status === 'refunded') {
      return NextResponse.json(
        { error: 'Payment already refunded' },
        { status: 400 }
      );
    }

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    const refundAmount = validation.data.amount || payment.amount;
    const razorpay = getRazorpayClient();

    // Process refund through Razorpay
    try {
      const refund = await razorpay.payments.refund(payment.gateway.paymentId!, {
        amount: refundAmount * 100, // Convert to paise
        notes: {
          reason: validation.data.reason,
          requestedBy: session.user.id,
        },
      });

      // Update payment record - convert string ID to ObjectId
      payment.status = 'refunded';
      payment.refund = {
        reason: validation.data.reason,
        amount: refundAmount,
        status: 'processed', // This matches the enum in IPayment
        requestedAt: new Date(),
        processedAt: new Date(),
        processedBy: new mongoose.Types.ObjectId(session.user.id), // Convert to ObjectId
        notes: `Refund ID: ${refund.id}`,
      };
      await payment.save();

      return NextResponse.json({
        message: 'Refund processed successfully',
        refundId: refund.id,
      });
    } catch (error: any) {
      console.error('Error processing refund:', error);
      
      // Update payment with failed refund
      payment.refund = {
        reason: validation.data.reason,
        amount: refundAmount,
        status: 'rejected', // This matches the enum in IPayment
        requestedAt: new Date(),
        notes: error.message,
        // processedBy is not set for failed refunds
      };
      await payment.save();

      return NextResponse.json(
        { error: 'Failed to process refund', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
