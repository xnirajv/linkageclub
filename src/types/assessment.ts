export type AssessmentLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface AssessmentQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface AssessmentBadge {
  name: string;
  description: string;
  image?: string;
  requiredScore: number;
}

export interface AssessmentAttempt {
  userId: string;
  score: number;
  passed: boolean;
  answers: number[];
  timeSpent: number;
  startedAt: Date | string;
  completedAt: Date | string | null;
}

export interface Assessment {
  _id: string;
  title: string;
  description: string;
  skillName: string;
  level: AssessmentLevel;
  price: number;
  duration: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentWithUserAttempt extends Assessment {
  userAttempt?: {
    score: number;
    passed: boolean;
    completedAt: Date | string;
  };
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
    startedAt: Date | string;
    completedAt: Date | string;
  };
  badgeEarned: boolean;
}

export interface AssessmentResults {
  score: number;
  passed: boolean;
  totalPoints: number;
  earnedPoints: number;
  passingScore: number;
  timeSpent: number;
  totalTime: number;
  questions: {
    question: string;
    options: string[];
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
}

export interface AssessmentsResponse {
  assessments: AssessmentWithUserAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AssessmentFilters {
  skill?: string;
  level?: AssessmentLevel;
  price?: 'free' | 'paid' | 'all';
  search?: string;
  page?: number;
  limit?: number;
}