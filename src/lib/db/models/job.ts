import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  companyId: mongoose.Types.ObjectId;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications?: string[];
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote';
  experience: {
    min: number;
    max: number;
    level: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
  };
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'month' | 'year' | 'hour';
  };
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    mandatory: boolean;
  }>;
  benefits: string[];
  department: string;
  openings: number;
  applications: Array<{
    userId: mongoose.Types.ObjectId;
    resume: string;
    coverLetter?: string;
    answers?: Array<{ question: string; answer: string }>;
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
    appliedAt: Date;
    reviewedAt?: Date;
    notes?: string;
  }>;
  questions?: Array<{
    question: string;
    type: 'text' | 'multiple-choice' | 'yes-no';
    options?: string[];
    required: boolean;
  }>;
  postedBy: mongoose.Types.ObjectId;
  postedAt: Date;
  deadline?: Date;
  status: 'draft' | 'published' | 'closed' | 'filled';
  views: number;
  applicationsCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: {
      type: [String],
      required: true,
      validate: [(v: any) => v.length > 0, 'At least one responsibility required'],
    },
    requirements: {
      type: [String],
      required: true,
      validate: [(v: any) => v.length > 0, 'At least one requirement required'],
    },
    preferredQualifications: [String],
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      required: true,
    },
    experience: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      level: {
        type: String,
        enum: ['fresher', 'junior', 'mid', 'senior', 'lead'],
        required: true,
      },
    },
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['month', 'year', 'hour'], default: 'year' },
    },
    skills: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          required: true,
        },
        mandatory: { type: Boolean, default: true },
      },
    ],
    benefits: [String],
    department: String,
    openings: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    applications: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        resume: { type: String, required: true },
        coverLetter: String,
        answers: [
          {
            question: String,
            answer: String,
          },
        ],
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
          default: 'pending',
        },
        appliedAt: { type: Date, default: Date.now },
        reviewedAt: Date,
        notes: String,
      },
    ],
    questions: [
      {
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ['text', 'multiple-choice', 'yes-no'],
          required: true,
        },
        options: [String],
        required: { type: Boolean, default: true },
      },
    ],
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'filled'],
      default: 'draft',
    },
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ companyId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ 'skills.name': 1 });
jobSchema.index({ postedAt: -1 });
jobSchema.index({ 'applications.userId': 1 });

// Update applications count
jobSchema.pre('save', function (next) {
  this.applicationsCount = this.applications.length;
  next();
});

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

export default Job;