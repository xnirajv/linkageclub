import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMilestone extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  amount: number;
  deadline: number;
  order: number;
  deliverables?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  submissions: mongoose.Types.ObjectId[];
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    deadline: { type: Number, required: true, min: 1 },
    order: { type: Number, default: 0 },
    deliverables: [String],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'approved'],
      default: 'pending',
      index: true,
    },
    submissions: [{ type: Schema.Types.ObjectId, ref: 'Submission' }],
    completedAt: Date,
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    feedback: String,
  },
  { timestamps: true }
);

milestoneSchema.index({ order: 1 });

const Milestone: Model<IMilestone> =
  mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', milestoneSchema);

export default Milestone;