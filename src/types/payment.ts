import { User } from './user';

export type PaymentType = 'project' | 'mentorship' | 'assessment' | 'subscription' | 'withdrawal' | 'refund';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'razorpay';
export type GatewayName = 'razorpay' | 'stripe' | 'paypal';

export interface PaymentMethodDetails {
  type: PaymentMethod;
  details: any;
}

export interface GatewayDetails {
  name: GatewayName;
  orderId?: string;
  paymentId?: string;
  signature?: string;
  webhookData?: any;
}

export interface PaymentFees {
  platformFee: number;
  tax: number;
  total: number;
  netAmount: number;
}

export interface RefundDetails {
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
}

export interface EscrowDetails {
  released: boolean;
  releasedAt?: Date;
  releasedBy?: string;
  conditions?: string[];
}

export interface Payment {
  _id: string;
  transactionId: string;
  userId: string;
  recipientId?: string;
  type: PaymentType;
  purpose: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethodDetails;
  
  // References
  projectId?: string;
  milestoneId?: string;
  applicationId?: string;
  sessionId?: string;
  assessmentId?: string;
  
  // Subscription
  subscriptionId?: string;
  planId?: string;
  planName?: string;
  period?: 'monthly' | 'yearly';
  
  // Gateway
  gateway: GatewayDetails;
  
  // Fees
  fees: PaymentFees;
  
  // Refund
  refund?: RefundDetails;
  
  // Escrow
  escrow?: EscrowDetails;
  
  metadata?: Record<string, any>;
  description?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  errorMessage?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  user?: User;
  recipient?: User;
}

export interface PaymentSummary {
  totalAmount: number;
  totalTransactions: number;
  successfulAmount: number;
  pendingAmount: number;
  failedAmount: number;
  refundedAmount: number;
}

export interface BalanceInfo {
  totalEarned: number;
  available: number;
  pending: number;
  withdrawn: number;
  pendingWithdrawals: number;
}

export interface MonthlyEarnings {
  thisMonth: number;
  lastMonth: number;
}

export type IPayment = Payment;
