import { User } from './user';

export type AvailabilityType = 'weekdays' | 'evenings' | 'weekends' | 'flexible';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface MentorExpertise {
  skill: string;
  level: 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  verified: boolean;
}

export interface AvailabilitySchedule {
  monday?: Array<{ start: string; end: string }>;
  tuesday?: Array<{ start: string; end: string }>;
  wednesday?: Array<{ start: string; end: string }>;
  thursday?: Array<{ start: string; end: string }>;
  friday?: Array<{ start: string; end: string }>;
  saturday?: Array<{ start: string; end: string }>;
  sunday?: Array<{ start: string; end: string }>;
}

export interface MentorAvailability {
  type: AvailabilityType;
  schedule?: AvailabilitySchedule;
  timezone: string;
  isAvailable?: boolean;
  nextAvailable?: boolean;
}

export interface MentorSession {
  _id: string;
  studentId: string;
  topic: string;
  description?: string;
  date: Date;
  duration: number;
  status: SessionStatus;
  amount: number;
  paymentStatus: PaymentStatus;
  meetingLink?: string;
  recording?: string;
  notes?: string;
  studentFeedback?: {
    rating: number;
    comment: string;
    submittedAt: Date;
  };
  mentorFeedback?: {
    rating: number;
    comment: string;
    submittedAt: Date;
  };
  createdAt: Date;
  
  // Populated fields
  student?: User;
}

export interface MentorResource {
  _id: string;
  title: string;
  description?: string;
  type: 'article' | 'video' | 'course' | 'template' | 'other';
  url: string;
  tags: string[];
  downloads: number;
  createdAt: Date;
}

export interface MentorReview {
  _id: string;
  studentId: string;
  sessionId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  
  // Populated fields
  student?: User;
}

export interface MentorStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  responseTime: number; // in hours
  repeatStudents: number;
}

export interface Mentor {
  _id: string;
  userId: User | string;
  expertise: MentorExpertise[];
  hourlyRate: number;
  currency: string;
  availability: MentorAvailability;
  sessions: MentorSession[];
  resources: MentorResource[];
  reviews: MentorReview[];
  stats: MentorStats;
  isVerified: boolean;
  isActive: boolean;
  featured: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  user?: User;
  matchScore?: number;
}

export type IMentor = Mentor;
