import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubmission extends Document {
  projectId: mongoose.Types.ObjectId;
  milestoneId: mongoose.Types.ObjectId;
  work: string;
  attachments: string[];
  hoursSpent?: number;
  notes?: string;
  feedback?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true, index: true },
    work: { type: String, required: true },
    attachments: [String],
    hoursSpent: Number,
    notes: String,
    feedback: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', submissionSchema);

export default Submission;