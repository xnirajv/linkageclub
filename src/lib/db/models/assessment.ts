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
    image: string;
    requiredScore: number;
  }>;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // For popular assessments
  ratings?: {
    average: number;
    count: number;
  };
  takenCount?: number;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skillName: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
    price: { type: Number, required: true, min: 0, default: 0 },
    duration: { type: Number, required: true, min: 5, max: 180 },
    passingScore: { type: Number, required: true, min: 50, max: 90, default: 70 },
    questions: [{
      question: { type: String, required: true },
      options: { type: [String], required: true, validate: [(v: any) => v.length >= 2] },
      correctAnswer: { type: Number, required: true },
      explanation: String,
      points: { type: Number, required: true, min: 1, default: 1 },
    }],
    attempts: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      score: { type: Number, required: true, default: 0 },
      passed: { type: Boolean, required: true, default: false },
      answers: { type: [Number], required: true, default: [] },
      timeSpent: { type: Number, required: true, default: 0 },
      startedAt: { type: Date, required: true, default: Date.now },
      completedAt: { type: Date, default: null },
    }],
    badges: [{
      name: { type: String, required: true },
      description: String,
      image: String,
      requiredScore: { type: Number, required: true, default: 70 },
    }],
    totalAttempts: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    takenCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for performance
assessmentSchema.index({ skillName: 1, level: 1 });
assessmentSchema.index({ price: 1 });
assessmentSchema.index({ isActive: 1 });
assessmentSchema.index({ totalAttempts: -1 }); // For popular
assessmentSchema.index({ 'ratings.average': -1 }); // For popular by rating

// Update stats after new attempt
assessmentSchema.pre('save', function(next) {
  if (this.attempts.length > 0) {
    const completedAttempts = this.attempts.filter(a => a.completedAt);
    this.totalAttempts = completedAttempts.length;
    this.takenCount = this.totalAttempts;
    if (completedAttempts.length > 0) {
      this.passRate = (completedAttempts.filter(a => a.passed).length / completedAttempts.length) * 100;
      this.averageScore = completedAttempts.reduce((acc, a) => acc + a.score, 0) / completedAttempts.length;
    }
  }
  next();
});

const Assessment: Model<IAssessment> = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', assessmentSchema);

export default Assessment;