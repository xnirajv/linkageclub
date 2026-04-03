import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssessment extends Document {
  title: string;
  description: string;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  price: number;
  duration: number; // in minutes
  passingScore: number; // percentage
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number; // index of correct option
    explanation?: string;
    points: number;
  }>;
  attempts: Array<{
    userId: mongoose.Types.ObjectId;
    score: number;
    passed: boolean;
    answers: number[];
    timeSpent: number; // in seconds
    startedAt: Date;
    completedAt: Date;
  }>;
  badges: Array<{
    name: string;
    description: string;
    image: string;
    requiredScore: number;
  }>;
  prerequisites?: string[]; // assessment IDs
  tags: string[];
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Assessment description is required'],
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 5,
      max: 180,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 50,
      max: 90,
      default: 70,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: { type: [String], required: true, validate: [(v: any) => v.length >= 2, 'At least 2 options required'] },
        correctAnswer: { type: Number, required: true },
        explanation: String,
        points: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    attempts: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        score: { type: Number, required: true },
        passed: { type: Boolean, required: true },
        answers: { type: [Number], required: true },
        timeSpent: { type: Number, required: true },
        startedAt: { type: Date, required: true },
        completedAt: { type: Date, required: true },
      },
    ],
    badges: [
      {
        name: { type: String, required: true },
        description: String,
        image: String,
        requiredScore: { type: Number, required: true },
      },
    ],
    prerequisites: [String],
    tags: [String],
    totalAttempts: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
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

// Indexes
assessmentSchema.index({ skillName: 1, level: 1 });
assessmentSchema.index({ tags: 1 });
assessmentSchema.index({ price: 1 });
assessmentSchema.index({ isActive: 1 });

// Update stats after new attempt
assessmentSchema.post('save', async function() {
  if (this.attempts.length > 0) {
    const completedAttempts = this.attempts.filter(a => a.completedAt);
    this.totalAttempts = completedAttempts.length;
    this.passRate = (completedAttempts.filter(a => a.passed).length / this.totalAttempts) * 100;
    this.averageScore = completedAttempts.reduce((acc, a) => acc + a.score, 0) / this.totalAttempts;
  }
});

const Assessment: Model<IAssessment> = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', assessmentSchema);

export default Assessment;