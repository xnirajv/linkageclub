import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  transactionId: string;
  userId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId;
  type: 'project' | 'mentorship' | 'assessment' | 'subscription' | 'withdrawal' | 'refund';
  purpose: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: {
    type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'razorpay';
    details: any;
  };
  
  // For project payments
  projectId?: mongoose.Types.ObjectId;
  milestoneId?: string;
  applicationId?: mongoose.Types.ObjectId;
  
  // For mentorship payments
  sessionId?: mongoose.Types.ObjectId;
  
  // For assessment payments
  assessmentId?: mongoose.Types.ObjectId;
  
  // For subscriptions
  subscriptionId?: string;
  planId?: string;
  planName?: string;
  period?: 'monthly' | 'yearly';
  
  // Payment gateway details
  gateway: {
    name: 'razorpay' | 'stripe' | 'paypal';
    orderId?: string;
    paymentId?: string;
    signature?: string;
    webhookData?: any;
  };
  
  // Fee breakdown
  fees: {
    platformFee: number;
    tax: number;
    total: number;
    netAmount: number;
  };
  
  // Refund details
  refund?: {
    reason: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected' | 'processed';
    requestedAt: Date;
    processedAt?: Date;
    processedBy?: mongoose.Types.ObjectId;
    notes?: string;
  };
  
  // Escrow details
  escrow?: {
    released: boolean;
    releasedAt?: Date;
    releasedBy?: mongoose.Types.ObjectId;
    conditions?: string[];
  };
  
  metadata?: Record<string, any>;
  description?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['project', 'mentorship', 'assessment', 'subscription', 'withdrawal', 'refund'],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'razorpay'],
        required: true,
      },
      details: Schema.Types.Mixed,
    },
    
    // References
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    milestoneId: String,
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Mentor.sessions',
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
    },
    
    // Subscription
    subscriptionId: String,
    planId: String,
    planName: String,
    period: {
      type: String,
      enum: ['monthly', 'yearly'],
    },
    
    // Gateway
    gateway: {
      name: {
        type: String,
        enum: ['razorpay', 'stripe', 'paypal'],
        required: true,
      },
      orderId: String,
      paymentId: String,
      signature: String,
      webhookData: Schema.Types.Mixed,
    },
    
    // Fees
    fees: {
      platformFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      netAmount: { type: Number, default: 0 },
    },
    
    // Refund
    refund: {
      reason: String,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processed'],
      },
      requestedAt: Date,
      processedAt: Date,
      processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
    },
    
    // Escrow
    escrow: {
      released: { type: Boolean, default: false },
      releasedAt: Date,
      releasedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      conditions: [String],
    },
    
    metadata: Schema.Types.Mixed,
    description: String,
    invoiceUrl: String,
    receiptUrl: String,
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ recipientId: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ projectId: 1 });
paymentSchema.index({ sessionId: 1 });
paymentSchema.index({ 'gateway.orderId': 1 });

// Generate transaction ID before saving
paymentSchema.pre('save', async function (next) {
  if (!this.transactionId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.transactionId = `TXN${year}${month}${day}${random}`;
  }
  next();
});

// Calculate fees
paymentSchema.pre('save', function (next) {
  if (this.isModified('amount')) {
    const platformFee = Math.round(this.amount * 0.1); // 10% platform fee
    const tax = Math.round(platformFee * 0.18); // 18% GST on platform fee
    const total = platformFee + tax;
    const netAmount = this.amount - total;
    
    this.fees = {
      platformFee,
      tax,
      total,
      netAmount,
    };
  }
  next();
});

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;