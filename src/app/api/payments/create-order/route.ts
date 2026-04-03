import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Razorpay from 'razorpay';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { generateTransactionId } from '@/lib/utils/generateToken';

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const orderSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().default('INR'),
  type: z.enum(['project', 'mentorship', 'assessment', 'subscription']),
  purpose: z.string(),
  projectId: z.string().optional(),
  sessionId: z.string().optional(),
  assessmentId: z.string().optional(),
  planId: z.string().optional(),
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
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();
    const razorpay = getRazorpayClient();

    // Create Razorpay order
    const options = {
      amount: validation.data.amount * 100, // Razorpay expects amount in paise
      currency: validation.data.currency,
      receipt: generateTransactionId(),
      notes: {
        userId: session.user.id,
        type: validation.data.type,
        purpose: validation.data.purpose,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = await Payment.create({
      transactionId: razorpayOrder.receipt,
      userId: session.user.id,
      type: validation.data.type,
      purpose: validation.data.purpose,
      amount: validation.data.amount,
      currency: validation.data.currency,
      status: 'pending',
      paymentMethod: {
        type: 'razorpay',
      },
      gateway: {
        name: 'razorpay',
        orderId: razorpayOrder.id,
      },
      ...(validation.data.projectId && { projectId: validation.data.projectId }),
      ...(validation.data.sessionId && { sessionId: validation.data.sessionId }),
      ...(validation.data.assessmentId && { assessmentId: validation.data.assessmentId }),
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
