import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISavedProject extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const savedProjectSchema = new Schema<ISavedProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

savedProjectSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const SavedProject: Model<ISavedProject> =
  mongoose.models.SavedProject || mongoose.model<ISavedProject>('SavedProject', savedProjectSchema);

export default SavedProject;