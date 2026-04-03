import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMentor extends Document {
  userId: mongoose.Types.ObjectId;
  expertise: Array<{
    skill: string;
    level: 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience: number;
    verified: boolean;
    rating?:number;
    length?:number;
  }>
  hourlyRate: number;
  currency: string;
  availability: {
    type: 'weekdays' | 'evenings' | 'weekends' | 'flexible';
    schedule?: {
      monday?: Array<{ start: string; end: string }>;
      tuesday?: Array<{ start: string; end: string }>;
      wednesday?: Array<{ start: string; end: string }>;
      thursday?: Array<{ start: string; end: string }>;
      friday?: Array<{ start: string; end: string }>;
      saturday?: Array<{ start: string; end: string }>;
      sunday?: Array<{ start: string; end: string }>;
    };
    timezone: string;
  };
  sessions: Array<{
    studentId: mongoose.Types.ObjectId;
    topic: string;
    description: string;
    date: Date;
    duration: number; // in minutes
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    amount: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
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
  }>;
  resources: Array<{
    title: string;
    description: string;
    type: 'article' | 'video' | 'course' | 'template' | 'other';
    url: string;
    tags: string[];
    downloads: number;
    createdAt: Date;
  }>;
  reviews: Array<{
    studentId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  stats: {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    responseTime: number; // in hours
    repeatStudents: number;
  };
  isVerified: boolean;
  isActive: boolean;
  featured: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mentorSchema = new Schema<IMentor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    expertise: [
      {
        skill: { type: String, required: true },
        level: {
          type: String,
          enum: ['intermediate', 'advanced', 'expert'],
          required: true,
        },
        yearsOfExperience: { type: Number, required: true, min: 0 },
        verified: { type: Boolean, default: false },
      },
    ],
    hourlyRate: {
      type: Number,
      required: true,
      min: 100,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    availability: {
      type: {
        type: String,
        enum: ['weekdays', 'evenings', 'weekends', 'flexible'],
        required: true,
      },
      schedule: {
        monday: [{ start: String, end: String }],
        tuesday: [{ start: String, end: String }],
        wednesday: [{ start: String, end: String }],
        thursday: [{ start: String, end: String }],
        friday: [{ start: String, end: String }],
        saturday: [{ start: String, end: String }],
        sunday: [{ start: String, end: String }],
      },
      timezone: { type: String, default: 'Asia/Kolkata' },
    },
    sessions: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        topic: { type: String, required: true },
        description: String,
        date: { type: Date, required: true },
        duration: { type: Number, required: true },
        status: {
          type: String,
          enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
          default: 'scheduled',
        },
        amount: { type: Number, required: true },
        paymentStatus: {
          type: String,
          enum: ['pending', 'paid', 'refunded'],
          default: 'pending',
        },
        meetingLink: String,
        recording: String,
        notes: String,
        studentFeedback: {
          rating: { type: Number, min: 1, max: 5 },
          comment: String,
          submittedAt: Date,
        },
        mentorFeedback: {
          rating: { type: Number, min: 1, max: 5 },
          comment: String,
          submittedAt: Date,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resources: [
      {
        title: { type: String, required: true },
        description: String,
        type: {
          type: String,
          enum: ['article', 'video', 'course', 'template', 'other'],
          required: true,
        },
        url: { type: String, required: true },
        tags: [String],
        downloads: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reviews: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        sessionId: { type: Schema.Types.ObjectId, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    stats: {
      totalSessions: { type: Number, default: 0 },
      completedSessions: { type: Number, default: 0 },
      cancelledSessions: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      responseRate: { type: Number, default: 100 },
      responseTime: { type: Number, default: 0 },
      repeatStudents: { type: Number, default: 0 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mentorSchema.index({ userId: 1 });
mentorSchema.index({ hourlyRate: 1 });
mentorSchema.index({ 'expertise.skill': 1 });
mentorSchema.index({ averageRating: -1 });
mentorSchema.index({ isVerified: 1 });
mentorSchema.index({ isActive: 1 });
mentorSchema.index({ featured: 1 });

// Update stats after new session or review
mentorSchema.pre('save', function (next) {
  if (this.isModified('sessions')) {
    const completed = this.sessions.filter(s => s.status === 'completed');
    const cancelled = this.sessions.filter(s => s.status === 'cancelled');
    
    this.stats.totalSessions = this.sessions.length;
    this.stats.completedSessions = completed.length;
    this.stats.cancelledSessions = cancelled.length;
    this.stats.totalEarnings = completed.reduce((acc, s) => acc + s.amount, 0);
  }
  
  if (this.isModified('reviews') && this.reviews.length > 0) {
    this.stats.totalReviews = this.reviews.length;
    this.stats.averageRating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    
    // Count repeat students
    const uniqueStudents = new Set(this.reviews.map(r => r.studentId.toString()));
    this.stats.repeatStudents = this.reviews.length - uniqueStudents.size;
  }
  
  next();
});

const Mentor: Model<IMentor> = mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', mentorSchema);

export default Mentor;