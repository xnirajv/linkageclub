import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICompanyProfile extends Document {
  userId: mongoose.Types.ObjectId;
  industry: string;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  foundedYear: string;
  createdAt: Date;
  updatedAt: Date;
}

const companyProfileSchema = new Schema<ICompanyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    },
    foundedYear: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const CompanyProfile: Model<ICompanyProfile> =
  mongoose.models.CompanyProfile ||
  mongoose.model<ICompanyProfile>('CompanyProfile', companyProfileSchema);

export default CompanyProfile;
