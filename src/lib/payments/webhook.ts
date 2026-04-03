import { NextRequest } from 'next/server';
import { verifyWebhookSignature } from './razorpay';
import Payment from '@/lib/db/models/payment';
import User from '@/lib/db/models/user';
import Notification from '@/lib/db/models/notification';
import { sendPaymentConfirmationEmail, sendPaymentFailedEmail } from '@/lib/email/payment';
import connectDB from '@/lib/db/connect';

export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: any;
    };
    order?: {
      entity: any;
    };
  };
  created_at: number;
}

/**
 * Handle Razorpay webhook events
 */
export async function handleRazorpayWebhook(req: NextRequest) {
  try {
    await connectDB();

    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      throw new Error('No signature provided');
    }

    const body = await req.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      throw new Error('Invalid webhook signature');
    }

    const event: RazorpayWebhookEvent = JSON.parse(body);

    switch (event.event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(event);
        break;
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'order.paid':
        await handleOrderPaid(event);
        break;
      case 'refund.created':
        await handleRefundCreated(event);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event);
        break;
      case 'transfer.processed':
        await handleTransferProcessed(event);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

async function handlePaymentAuthorized(event: RazorpayWebhookEvent) {
  const paymentEntity = event.payload.payment.entity;

  await Payment.findOneAndUpdate(
    { 'gateway.orderId': paymentEntity.order_id },
    {
      'gateway.paymentId': paymentEntity.id,
      status: 'processing',
      metadata: {
        ...paymentEntity,
      },
    }
  );

  console.log(`Payment authorized: ${paymentEntity.id}`);
}

async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  const paymentEntity = event.payload.payment.entity;

  const payment = await Payment.findOneAndUpdate(
    { 'gateway.orderId': paymentEntity.order_id },
    {
      'gateway.paymentId': paymentEntity.id,
      status: 'completed',
      metadata: {
        ...paymentEntity,
      },
    },
    { new: true }
  );

  if (!payment) {
    console.error('Payment not found:', paymentEntity.order_id);
    return;
  }

  if (payment.type === 'withdrawal' && payment.recipientId) {
    await User.findByIdAndUpdate(payment.recipientId, {
      $inc: { 'stats.totalEarnings': payment.amount },
    });
  }

  await Notification.create({
    userId: payment.userId,
    type: 'payment_success',
    title: 'Payment Successful',
    message: `Your payment of Rs ${payment.amount} has been processed successfully.`,
    link: `/payments/${payment._id}`,
  });

  const user = await User.findById(payment.userId);
  if (user) {
    await sendPaymentConfirmationEmail(user.email, {
      amount: payment.amount,
      transactionId: payment.gateway?.paymentId || payment.transactionId,
      date: new Date(),
    });
  }

  console.log(`Payment captured: ${paymentEntity.id}`);
}

async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  const paymentEntity = event.payload.payment.entity;

  const payment = await Payment.findOneAndUpdate(
    { 'gateway.orderId': paymentEntity.order_id },
    {
      'gateway.paymentId': paymentEntity.id,
      status: 'failed',
      errorMessage: paymentEntity.error_description || 'Payment failed',
      metadata: {
        ...paymentEntity,
      },
    },
    { new: true }
  );

  if (!payment) {
    console.error('Payment not found:', paymentEntity.order_id);
    return;
  }

  await Notification.create({
    userId: payment.userId,
    type: 'payment_failed',
    title: 'Payment Failed',
    message: `Your payment of Rs ${payment.amount} has failed. ${paymentEntity.error_description}`,
    link: `/payments/${payment._id}`,
  });

  const user = await User.findById(payment.userId);
  if (user) {
    await sendPaymentFailedEmail(user.email, {
      amount: payment.amount,
      reason: paymentEntity.error_description,
    });
  }

  console.log(`Payment failed: ${paymentEntity.id}`);
}

async function handleOrderPaid(event: RazorpayWebhookEvent) {
  const orderEntity = event.payload.order?.entity;
  if (!orderEntity) return;

  console.log(`Order paid: ${orderEntity.id}`);
}

async function handleRefundCreated(event: RazorpayWebhookEvent) {
  const paymentEntity = event.payload.payment.entity;

  await Payment.findOneAndUpdate(
    { 'gateway.paymentId': paymentEntity.id },
    {
      status: 'refunded',
      refund: {
        amount: paymentEntity.amount || 0,
        reason: 'Processed by payment gateway',
        status: 'processed',
        requestedAt: new Date(),
        processedAt: new Date(),
      },
    }
  );

  console.log(`Refund created: ${paymentEntity.id}`);
}

async function handleRefundProcessed(event: RazorpayWebhookEvent) {
  const paymentEntity = event.payload.payment.entity;
  const payment = await Payment.findOne({ 'gateway.paymentId': paymentEntity.id });

  if (payment) {
    await Notification.create({
      userId: payment.userId,
      type: 'refund_processed',
      title: 'Refund Processed',
      message: `Your refund of Rs ${payment.amount} has been processed.`,
      link: `/payments/${payment._id}`,
    });
  }

  console.log(`Refund processed: ${paymentEntity.id}`);
}

async function handleTransferProcessed(event: RazorpayWebhookEvent) {
  console.log('Transfer processed:', event);
}

export default {
  handleRazorpayWebhook,
};
