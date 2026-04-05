import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: 'student' | 'company' | 'mentor' | 'founder' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  trustScore: number;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verified: boolean;
    verifiedAt?: Date;
  }>;
  badges: Array<{
    name: string;
    description: string;
    image: string;
    earnedAt: Date;
  }>;
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  verification: {
    email: boolean;
    phone: boolean;
    id: boolean;
    linkedin: boolean;
    github: boolean;
  };
  stats: {
    projectsCompleted: number;
    totalEarnings: number;
    averageRating: number;
    reviewsCount: number;
    sessionsAttended: number;
    daysActive: number;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;

  // Ban system
  isBanned?: boolean
  banReason?: string
  banExpiresAt?: Date | null
  bannedBy?: string
  bannedAt?: Date

  isActive: boolean;
  deletedAt?: Date | null;
  deletedBy?: mongoose.Types.ObjectId | string | null;

  isVerified?: boolean;
  verifiedAt?: Date | null;
  verifiedBy?: mongoose.Types.ObjectId | string | null;

  isDeleted?: boolean;

  // Education & Experience
  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    grade: string;
  }>;
  experience?: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    role: {
      type: String,
      enum: ['student', 'company', 'mentor', 'founder', 'admin'],
      default: 'student',
      required: true,
    },
    avatar: {
      type: String,
      default: '/images/default-avatar.png',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    location: String,
    phone: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    trustScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    skills: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'beginner',
        },
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
      },
    ],
    badges: [
      {
        name: { type: String, required: true },
        description: String,
        image: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },
    verification: {
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      id: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
      github: { type: Boolean, default: false },
    },
    stats: {
      projectsCompleted: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      reviewsCount: { type: Number, default: 0 },
      sessionsAttended: { type: Number, default: 0 },
      daysActive: { type: Number, default: 0 },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
    },
    banExpiresAt: {
      type: Date,
    },
    bannedBy: {
      type: String,
    },
    bannedAt: {
      type: Date,
    },
    // Education & Experience fields
    education: [
      {
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        field: { type: String, default: '' },
        startYear: { type: String, default: '' },
        endYear: { type: String, default: '' },
        grade: { type: String, default: '' },
      },
    ],
    experience: [
      {
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ trustScore: -1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ location: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Update lastActive on any save
userSchema.pre('save', function (next) {
  this.lastActive = new Date();
  next();
});

// Calculate trust score before saving
userSchema.pre('save', function (next) {
  if (this.isModified('skills') || this.isModified('verification') || this.isModified('stats')) {
    let score = 0;

    // Skills score (max 35)
    const verifiedSkills = this.skills.filter(s => s.verified).length;
    score += Math.min(verifiedSkills * 15, 35);

    // Verification score (max 20)
    const verificationFactors = [
      this.verification.email,
      this.verification.phone,
      this.verification.id,
      this.verification.linkedin,
      this.verification.github,
    ];
    const verifiedCount = verificationFactors.filter(Boolean).length;
    score += verifiedCount * 4;

    // Stats score (max 45)
    const projectScore = Math.min(this.stats.projectsCompleted * 5, 20);
    const earningsScore = Math.min(this.stats.totalEarnings / 10000, 15);
    const ratingScore = this.stats.averageRating * 2;
    score += projectScore + earningsScore + ratingScore;

    this.trustScore = Math.min(Math.round(score), 100);
  }
  next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;