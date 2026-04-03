import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import { logger } from '@/lib/utils/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const webhookData = JSON.parse(body);
    const { event, payload } = webhookData;

    await connectDB();

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;

      case 'refund.processed':
        await handleRefundProcessed(payload);
        break;

      default:
        logger.webhook(`Unhandled event: ${event}`, { event });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payload: any) {
  const { payment } = payload;
  
  const paymentRecord = await Payment.findOne({ 
    'gateway.orderId': payment.order_id 
  });

  if (paymentRecord) {
    // Idempotency check: Skip if already processed
    if (paymentRecord.status === 'completed' && 
        paymentRecord.gateway.paymentId === payment.id) {
      logger.webhook('Payment already processed', { 
        paymentId: payment.id,
        orderId: payment.order_id 
      });
      return;
    }

    paymentRecord.status = 'completed';
    paymentRecord.gateway.paymentId = payment.id;
    paymentRecord.gateway.webhookData = payload;
    await paymentRecord.save();
  }
}

async function handlePaymentFailed(payload: any) {
  const { payment } = payload;
  
  const paymentRecord = await Payment.findOne({ 
    'gateway.orderId': payment.order_id 
  });

  if (paymentRecord) {
    // Idempotency check: Skip if already marked as failed
    if (paymentRecord.status === 'failed') {
      logger.webhook('Payment already marked as failed', { 
        paymentId: payment.id,
        orderId: payment.order_id 
      });
      return;
    }

    paymentRecord.status = 'failed';
    paymentRecord.errorMessage = payment.error_description;
    paymentRecord.gateway.webhookData = payload;
    await paymentRecord.save();
  }
}

async function handleRefundProcessed(payload: any) {
  const { refund } = payload;
  
  const paymentRecord = await Payment.findOne({ 
    'gateway.paymentId': refund.payment_id 
  });

  if (paymentRecord) {
    // Idempotency check: Skip if already refunded
    if (paymentRecord.status === 'refunded') {
      logger.webhook('Payment already refunded', { 
        paymentId: refund.payment_id 
      });
      return;
    }

    // Update payment record with refund details
    paymentRecord.status = 'refunded';
    
    // Create refund object with all required fields
    paymentRecord.refund = {
      reason: refund.notes?.reason || 'Refund processed',
      amount: refund.amount / 100,
      status: 'processed',
      requestedAt: paymentRecord.refund?.requestedAt || new Date(), // Use existing or current date
      processedAt: new Date(),
      // processedBy is optional, can be omitted
      // notes is optional, can be omitted
    };
    
    await paymentRecord.save();

    logger.webhook('Refund processed successfully', {
      paymentId: refund.payment_id,
      refundId: refund.id,
      amount: refund.amount / 100
    });
  }
}