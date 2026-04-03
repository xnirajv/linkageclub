import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 
    | 'application_received'
    | 'application_shortlisted'
    | 'application_accepted'
    | 'application_rejected'
    | 'project_milestone'
    | 'project_completed'
    | 'payment_received'
    | 'payment_released'
    | 'session_scheduled'
    | 'session_reminder'
    | 'session_completed'
    | 'message_received'
    | 'review_received'
    | 'badge_earned'
    | 'trust_score_updated'
    | 'job_alert'
    | 'mentor_recommendation'
    | 'system_alert';
  
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  
  read: boolean;
  readAt?: Date;
  
  priority: 'low' | 'medium' | 'high';
  category: 'application' | 'project' | 'payment' | 'session' | 'message' | 'system' | 'promotional';
  
  emailSent: boolean;
  pushSent: boolean;
  smsSent: boolean;
  
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'application_received',
        'application_shortlisted',
        'application_accepted',
        'application_rejected',
        'project_milestone',
        'project_completed',
        'payment_received',
        'payment_released',
        'session_scheduled',
        'session_reminder',
        'session_completed',
        'message_received',
        'review_received',
        'badge_earned',
        'trust_score_updated',
        'job_alert',
        'mentor_recommendation',
        'system_alert',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    link: String,
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['application', 'project', 'payment', 'session', 'message', 'system', 'promotional'],
      required: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    pushSent: {
      type: Boolean,
      default: false,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto expire notifications after 30 days
notificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    this.expiresAt = thirtyDaysFromNow;
  }
  next();
});

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;