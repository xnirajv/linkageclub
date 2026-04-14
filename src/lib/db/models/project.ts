import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  summary?: string;
  description: string;
  companyId: mongoose.Types.ObjectId;
  category: string;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    mandatory: boolean;
  }>;
  budget: {
    type: 'fixed' | 'hourly' | 'milestone';
    min: number;
    max: number;
    currency: string;
  };
  duration: number;
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    label?: string;
  };
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    deadline: number;
    status: 'pending' | 'in_progress' | 'completed' | 'approved';
  }>;
  requirements: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'any';
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'invite';
  attachments: string[];
  isFeatured: boolean;
  applications: Array<{
    userId: mongoose.Types.ObjectId;
    proposedAmount: number;
    proposedDuration: number;
    coverLetter: string;
    attachments: string[];
    status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
    submittedAt: Date;
    reviewedAt?: Date;
    reviewNotes?: string;
  }>;
  selectedApplicant?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  reviews: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  tags: string[];
  views: number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [200, 'Summary cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'AI / ML',
        'Data Science',
        'DevOps',
        'Design',
        'Content Writing',
        'Marketing',
        'Other',
      ],
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
    budget: {
      type: {
        type: String,
        enum: ['fixed', 'hourly', 'milestone'],
        required: true,
      },
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR' },
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    location: {
      type: {
        type: String,
        enum: ['remote', 'onsite', 'hybrid'],
        default: 'remote',
      },
      label: String,
    },
    milestones: [
      {
        title: { type: String, required: true },
        description: String,
        amount: { type: Number, required: true },
        deadline: { type: Number, required: true },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed', 'approved'],
          default: 'pending',
        },
      },
    ],
    requirements: [String],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'any'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'invite'],
      default: 'public',
    },
    attachments: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    applications: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        proposedAmount: { type: Number, required: true },
        proposedDuration: { type: Number, required: true },
        coverLetter: { type: String, required: true },
        attachments: [String],
        status: {
          type: String,
          enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
          default: 'pending',
        },
        submittedAt: { type: Date, default: Date.now },
        reviewedAt: Date,
        reviewNotes: String,
      },
    ],
    selectedApplicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    startDate: Date,
    endDate: Date,
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [String],
    views: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes
projectSchema.index({ companyId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ 'skills.name': 1 });
projectSchema.index({ budget: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ 'applications.userId': 1 });

// Update applications count
projectSchema.pre('save', function (next) {
  this.applicationsCount = this.applications.length;
  next();
});

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

export default Project;
