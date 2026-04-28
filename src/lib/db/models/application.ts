import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IApplication extends Document {
  type: 'project' | 'job';
  projectId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  proposedAmount?: number;
  proposedDuration?: number;
  coverLetter: string;
  attachments: string[];
  portfolio?: string;
  additionalInfo?: string;
  resume?: string;
  answers?: Array<{ question: string; answer: string }>;
  status:
    | 'pending'
    | 'reviewed'
    | 'shortlisted'
    | 'interview_scheduled'
    | 'interview_completed'
    | 'interview_cancelled'
    | 'accepted'
    | 'rejected'
    | 'withdrawn';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  interview?: {
    scheduled: boolean;
    date?: Date;
    type?: 'video' | 'phone' | 'in-person';
    link?: string;
    notes?: string;
    feedback?: string;
    rating?: number;
  };
  messages: Array<{
    senderId: mongoose.Types.ObjectId;
    content: string;
    attachments?: string[];
    read: boolean;
    readAt?: Date;
    createdAt: Date;
  }>;
  submittedAt: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
  }>;
}

const applicationSchema = new Schema<IApplication>(
  {
    type: { type: String, enum: ['project', 'job'], required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', index: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    proposedAmount: { type: Number, min: 0 },
    proposedDuration: { type: Number, min: 1 },
    coverLetter: { type: String, required: true },
    attachments: { type: [String], default: [] },
    portfolio: String,
    additionalInfo: String,
    matchScore: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    resume: String,
    answers: [{ question: String, answer: String }],
    status: {
      type: String,
      enum: [
        'pending', 'reviewed', 'shortlisted',
        'interview_scheduled', 'interview_completed', 'interview_cancelled',
        'accepted', 'rejected', 'withdrawn',
      ],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNotes: String,
    interview: {
      scheduled: { type: Boolean, default: false },
      date: Date,
      type: { type: String, enum: ['video', 'phone', 'in-person'] },
      link: String,
      notes: String,
      feedback: String,
      rating: { type: Number, min: 1, max: 5 },
    },
    messages: {
      type: [
        {
          senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          content: { type: String, required: true },
          attachments: [String],
          read: { type: Boolean, default: false },
          readAt: Date,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    submittedAt: { type: Date, default: Date.now, index: true },
    lastUpdated: { type: Date, default: Date.now },
    statusHistory: {
      type: [
        {
          status: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
          notes: String,
          updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

applicationSchema.index(
  { applicantId: 1, projectId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: 'project', projectId: { $exists: true } } }
);

applicationSchema.index(
  { applicantId: 1, jobId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: 'job', jobId: { $exists: true } } }
);

applicationSchema.pre('save', function (next) {
  this.lastUpdated = new Date();

  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory = [
      { status: this.status, timestamp: this.submittedAt || new Date() },
    ];
  }

  next();
});

applicationSchema.pre('validate', function (next) {
  if (this.type === 'project' && !this.projectId) {
    next(new Error('Project ID is required for project applications'));
    return;
  }

  if (this.type === 'job' && !this.jobId) {
    next(new Error('Job ID is required for job applications'));
    return;
  }

  next();
});

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);

export default Application;