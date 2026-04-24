import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssessment extends Document {
  title: string;
  description: string;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price: number;
  duration: number;
  passingScore: number;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    points: number;
  }>;
  attempts: Array<{
    userId: mongoose.Types.ObjectId;
    score: number;
    passed: boolean;
    answers: number[];
    timeSpent: number;
    startedAt: Date;
    completedAt: Date | null;
  }>;
  badges: Array<{
    name: string;
    description: string;
    image?: string;
    requiredScore: number;
  }>;
  prerequisites: string[];
  tags: string[];
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema(
  {
    question: { 
      type: String, 
      required: [true, 'Question text is required'],
      trim: true 
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2,
        message: 'At least 2 options are required',
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: { type: String, default: '' },
    points: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: true }
);

const attemptSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    answers: { type: [Number], default: [] },
    timeSpent: { type: Number, default: 0 },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { _id: true }
);

const badgeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  requiredScore: { type: Number, required: true, min: 0, max: 100 },
});

const assessmentSchema = new Schema<IAssessment>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      index: true,
    },
    level: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced', 'expert'],
        message: '{VALUE} is not a valid level',
      },
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: [5, 'Duration must be at least 5 minutes'],
      max: [180, 'Duration cannot exceed 180 minutes'],
    },
    passingScore: {
      type: Number,
      required: true,
      min: [50, 'Passing score must be at least 50%'],
      max: [90, 'Passing score cannot exceed 90%'],
      default: 70,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (v: any[]) => v.length >= 1,
        message: 'At least 1 question is required',
      },
    },
    attempts: {
      type: [attemptSchema],
      default: [],
    },
    badges: {
      type: [badgeSchema],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    totalAttempts: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
assessmentSchema.index({ skillName: 1, level: 1 });
assessmentSchema.index({ price: 1 });
assessmentSchema.index({ 'attempts.userId': 1 });
assessmentSchema.index({ totalAttempts: -1, averageScore: -1 });

// Update stats method
assessmentSchema.methods.updateStats = function () {
  const completedAttempts = this.attempts.filter((a: any) => a.completedAt);
  this.totalAttempts = completedAttempts.length;
  
  if (completedAttempts.length > 0) {
    const passedCount = completedAttempts.filter((a: any) => a.passed).length;
    this.passRate = Math.round((passedCount / completedAttempts.length) * 100);
    this.averageScore = Math.round(
      completedAttempts.reduce((acc: number, a: any) => acc + a.score, 0) / completedAttempts.length
    );
  } else {
    this.passRate = 0;
    this.averageScore = 0;
  }
};

const Assessment: Model<IAssessment> =
  mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', assessmentSchema);

export default Assessment;