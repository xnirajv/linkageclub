import Razorpay from 'razorpay';
import crypto from 'crypto';

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured.');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export interface CreateOrderParams {
  amount: number; // in paise (100 paise = 1 INR)
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface CreateOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

/**
 * Create a Razorpay order
 */
export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
  try {
    const razorpay = getRazorpayClient();
    const options = {
      amount: params.amount,
      currency: params.currency || 'INR',
      receipt: params.receipt || `rcpt_${Date.now()}`,
      notes: params.notes || {},
    };

    const order = await razorpay.orders.create(options);
    return order as CreateOrderResponse;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}

/**
 * Fetch payment details
 */
export async function fetchPayment(paymentId: string) {
  try {
    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw new Error('Failed to fetch payment details');
  }
}

/**
 * Capture a payment
 */
export async function capturePayment(paymentId: string, amount: number, currency: string = 'INR') {
  try {
    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.capture(paymentId, amount, currency);
    return payment;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw new Error('Failed to capture payment');
  }
}

/**
 * Create a refund
 */
export async function createRefund(paymentId: string, amount?: number, notes?: Record<string, any>) {
  try {
    const razorpay = getRazorpayClient();
    const refundData: any = {
      payment_id: paymentId,
    };

    if (amount) {
      refundData.amount = amount;
    }

    if (notes) {
      refundData.notes = notes;
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Fetch refund details
 */
export async function fetchRefund(paymentId: string, refundId: string) {
  try {
    const razorpay = getRazorpayClient();
    const refund = await razorpay.payments.fetchRefund(paymentId, refundId);
    return refund;
  } catch (error) {
    console.error('Error fetching refund:', error);
    throw new Error('Failed to fetch refund details');
  }
}

/**
 * Create a transfer (for escrow/marketplace)
 */
export async function createTransfer(params: {
  amount: number;
  currency: string;
  source: string;
  account: string;
  notes?: Record<string, any>;
}) {
  try {
    const razorpay = getRazorpayClient();
    const transfer = await razorpay.transfers.create({
      amount: params.amount,
      currency: params.currency,
      account: params.account,
      notes: {
        ...(params.notes || {}),
        source: params.source,
      },
    } as any);
    return transfer;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw new Error('Failed to create transfer');
  }
}

/**
 * Create a payout
 */
export async function createPayout(params: {
  account_number: string;
  amount: number;
  currency: string;
  mode: string;
  purpose: string;
  fund_account_id: string;
  queue_if_low_balance?: boolean;
  reference_id?: string;
  narration?: string;
  notes?: Record<string, any>;
}) {
  try {
    const razorpay = getRazorpayClient();
    const payout = await (razorpay as any).payouts.create(params);
    return payout;
  } catch (error) {
    console.error('Error creating payout:', error);
    throw new Error('Failed to create payout');
  }
}

/**
 * Create a fund account
 */
export async function createFundAccount(params: {
  customer_id: string;
  account_type: 'bank_account' | 'vpa';
  bank_account?: {
    name: string;
    ifsc: string;
    account_number: string;
  };
  vpa?: {
    address: string;
  };
}) {
  try {
    const razorpay = getRazorpayClient();
    const payload =
      params.account_type === 'bank_account'
        ? {
            customer_id: params.customer_id,
            account_type: 'bank_account' as const,
            bank_account: params.bank_account!,
          }
        : {
            customer_id: params.customer_id,
            account_type: 'vpa' as const,
            vpa: params.vpa!,
          };

    const fundAccount = await razorpay.fundAccount.create(payload as any);
    return fundAccount;
  } catch (error) {
    console.error('Error creating fund account:', error);
    throw new Error('Failed to create fund account');
  }
}

/**
 * Create a customer
 */
export async function createCustomer(params: {
  name: string;
  email: string;
  contact?: string;
  fail_existing?: boolean | 0 | 1;
  notes?: Record<string, any>;
}) {
  try {
    const razorpay = getRazorpayClient();
    const customer = await razorpay.customers.create(params);
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export default {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  capturePayment,
  createRefund,
  fetchRefund,
  createTransfer,
  createPayout,
  createFundAccount,
  createCustomer,
  verifyWebhookSignature,
};
