import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  type: 'project' | 'job';
  projectId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  
  // Project specific
  proposedAmount?: number;
  proposedDuration?: number;
  coverLetter: string;
  attachments: string[];
  
  // Job specific
  resume?: string;
  answers?: Array<{ question: string; answer: string }>;
  
  // Common
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interview_completed' | 'interview_cancelled' | 'accepted' | 'rejected' | 'withdrawn';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Interview
  interview?: {
    scheduled: boolean;
    date?: Date;
    type?: 'video' | 'phone' | 'in-person';
    link?: string;
    notes?: string;
    feedback?: string;
    rating?: number;
  };
  
  // Communication
  messages: Array<{
    senderId: mongoose.Types.ObjectId;
    content: string;
    attachments?: string[];
    read: boolean;
    readAt?: Date;
    createdAt: Date;
  }>;
  
  // Timeline
  submittedAt: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;

  matchScore?: number;  // ✅ Add this
  matchedSkills?: string[];  // ✅ Add this
  missingSkills?: string[];
}

const applicationSchema = new Schema<IApplication>(
  {
    type: {
      type: String,
      enum: ['project', 'job'],
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Project specific
    proposedAmount: {
      type: Number,
      min: 0,
    },
    proposedDuration: {
      type: Number,
      min: 1,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    attachments: [String],
    matchScore: { type: Number, default: 0 },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    
    // Job specific
    resume: String,
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    
    // Common
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'interview_completed', 'interview_cancelled', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    reviewNotes: String,
    
    // Interview
    interview: {
      scheduled: { type: Boolean, default: false },
      date: Date,
      type: {
        type: String,
        enum: ['video', 'phone', 'in-person'],
      },
      link: String,
      notes: String,
      feedback: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    
    // Communication
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        attachments: [String],
        read: { type: Boolean, default: false },
        readAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
applicationSchema.index({ applicantId: 1 });
applicationSchema.index({ companyId: 1 });
applicationSchema.index({ projectId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ submittedAt: -1 });

// Update lastUpdated on message or status change
applicationSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Ensure only one of projectId or jobId is set
applicationSchema.pre('validate', function (next) {
  if (this.type === 'project' && !this.projectId) {
    next(new Error('Project ID is required for project applications'));
  } else if (this.type === 'job' && !this.jobId) {
    next(new Error('Job ID is required for job applications'));
  } else {
    next();
  }
});

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);

export default Application;