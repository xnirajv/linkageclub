export type NotificationType = 
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

export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationCategory = 'application' | 'project' | 'payment' | 'session' | 'message' | 'system' | 'promotional';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  link?: string;
  read: boolean;
  readAt?: Date;
  priority: NotificationPriority;
  category: NotificationCategory;
  emailSent: boolean;
  pushSent: boolean;
  smsSent: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  categories: {
    application: boolean;
    project: boolean;
    payment: boolean;
    session: boolean;
    message: boolean;
    system: boolean;
    promotional: boolean;
  };
}