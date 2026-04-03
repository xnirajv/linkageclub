export type AssessmentLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface AssessmentQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface AssessmentAttempt {
  userId: string;
  score: number;
  passed: boolean;
  answers: number[];
  timeSpent: number; // in seconds
  startedAt: Date;
  completedAt: Date;
}

export interface AssessmentBadge {
  name: string;
  description: string;
  image: string;
  requiredScore: number;
}

export interface Assessment {
  _id: string;
  title: string;
  description: string;
  skillName: string;
  level: AssessmentLevel;
  price: number;
  duration: number; // in minutes
  passingScore: number;
  questions: AssessmentQuestion[];
  attempts: AssessmentAttempt[];
  badges: AssessmentBadge[];
  prerequisites?: string[];
  tags: string[];
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // For UI
  userAttempt?: AssessmentAttempt;
}

export interface AssessmentResult {
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  passingScore: number;
  timeSpent: number;
  totalTime: number;
  questions: Array<{
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation?: string;
    points: number;
  }>;
}

export interface UserAssessment {
  id: string;
  title: string;
  skillName: string;
  level: AssessmentLevel;
  passingScore: number;
  attempt: {
    score: number;
    passed: boolean;
    timeSpent: number;
    startedAt: Date;
    completedAt: Date;
  };
  badgeEarned: boolean;
}