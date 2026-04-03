import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only save a job once
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const SavedJob: Model<ISavedJob> = mongoose.models.SavedJob || mongoose.model<ISavedJob>('SavedJob', savedJobSchema);

export default SavedJob;