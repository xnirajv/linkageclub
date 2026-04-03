import { z } from 'zod';

// Question validation schemas
export const questionOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().optional().default(false),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(questionOptionSchema).min(2, 'At least 2 options are required'),
  correctAnswer: z.number().min(0, 'Correct answer index is required'),
  explanation: z.string().optional(),
  points: z.number().min(1, 'Points must be at least 1').max(10, 'Points cannot exceed 10'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  type: z.enum(['multiple-choice', 'true-false', 'single-choice']).default('multiple-choice'),
});

// Alternative question schema with options as array of strings
export const simpleQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, 'Question must be at least 5 characters'),
  options: z.array(z.string()).min(2, 'At least 2 options are required'),
  correctAnswer: z.number().min(0, 'Correct answer index is required'),
  explanation: z.string().optional(),
  points: z.number().min(1, 'Points must be at least 1').max(10, 'Points cannot exceed 10'),
});

// Badge validation schema
export const badgeSchema = z.object({
  name: z.string().min(3, 'Badge name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url('Please enter a valid image URL'),
  requiredScore: z.number().min(50, 'Required score must be at least 50%').max(100, 'Required score cannot exceed 100%'),
  level: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
});

// Assessment creation schema
export const assessmentSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  skillName: z.string()
    .min(2, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    errorMap: () => ({ message: 'Please select a valid difficulty level' }),
  }),
  price: z.number()
    .min(0, 'Price cannot be negative'),
  duration: z.number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(180, 'Duration cannot exceed 180 minutes'),
  passingScore: z.number()
    .min(50, 'Passing score must be at least 50%')
    .max(90, 'Passing score cannot exceed 90%'),
  questions: z.array(simpleQuestionSchema)
    .min(1, 'At least 1 question is required')
    .max(100, 'Cannot exceed 100 questions'),
  badges: z.array(badgeSchema).optional(),
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isPremium: z.boolean().default(false),
});

// Assessment update schema (all fields optional)
export const assessmentUpdateSchema = assessmentSchema.partial();

// Assessment attempt schema
export const assessmentAttemptSchema = z.object({
  assessmentId: z.string(),
  answers: z.array(z.number()),
  timeSpent: z.number().min(0, 'Time spent cannot be negative'),
});

// Assessment result schema
export const assessmentResultSchema = z.object({
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  answers: z.array(z.number()),
  timeSpent: z.number(),
  completedAt: z.date().optional(),
});

// Assessment review schema
export const assessmentReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(500, 'Review cannot exceed 500 characters').optional(),
  difficulty: z.enum(['too-easy', 'just-right', 'too-hard']).optional(),
  wouldRecommend: z.boolean().optional(),
});

// Assessment search filters
export const assessmentSearchSchema = z.object({
  query: z.string().optional(),
  skillName: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minDuration: z.number().min(0).optional(),
  maxDuration: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  sortBy: z.enum(['title', 'price', 'duration', 'popularity', 'rating']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Assessment statistics schema
export const assessmentStatsSchema = z.object({
  totalAttempts: z.number(),
  passRate: z.number().min(0).max(100),
  averageScore: z.number().min(0).max(100),
  averageTime: z.number(),
  ratingCount: z.number(),
  averageRating: z.number().min(0).max(5),
  questionStats: z.array(z.object({
    questionId: z.string(),
    correctCount: z.number(),
    totalAttempts: z.number(),
    averageTime: z.number(),
  })).optional(),
});

// Assessment category schema
export const assessmentCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().min(0).optional(),
});

// Assessment skill schema
export const assessmentSkillSchema = z.object({
  name: z.string().min(2, 'Skill name is required'),
  category: z.string().optional(),
  description: z.string().optional(),
  popularity: z.number().min(0).max(100).optional(),
});

// Assessment bundle schema
export const assessmentBundleSchema = z.object({
  name: z.string().min(3, 'Bundle name is required'),
  description: z.string().min(10, 'Description is required'),
  assessments: z.array(z.string()).min(1, 'At least one assessment is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  discount: z.number().min(0).max(100).optional(),
  validityDays: z.number().min(1).max(365).optional(),
  tags: z.array(z.string()).optional(),
});

// Assessment schedule schema
export const assessmentScheduleSchema = z.object({
  assessmentId: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  maxAttempts: z.number().min(1).optional(),
  timeWindow: z.number().min(0).optional(),
  allowedUsers: z.array(z.string()).optional(),
  proctoring: z.boolean().default(false),
});

// Assessment feedback schema
export const assessmentFeedbackSchema = z.object({
  assessmentId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(1000).optional(),
  wouldRecommend: z.boolean(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  suggestions: z.string().max(500).optional(),
});

// Assessment draft schema
export const assessmentDraftSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  skillName: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  price: z.number().min(0).optional(),
  duration: z.number().min(5).optional(),
  passingScore: z.number().min(50).max(90).optional(),
  questions: z.array(simpleQuestionSchema).optional(),
  badges: z.array(badgeSchema).optional(),
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lastSaved: z.date().optional(),
  version: z.number().optional(),
});

// Type exports
export type Question = z.infer<typeof questionSchema>;
export type SimpleQuestion = z.infer<typeof simpleQuestionSchema>;
export type Badge = z.infer<typeof badgeSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type AssessmentUpdate = z.infer<typeof assessmentUpdateSchema>;
export type AssessmentAttempt = z.infer<typeof assessmentAttemptSchema>;
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;
export type AssessmentReview = z.infer<typeof assessmentReviewSchema>;
export type AssessmentSearch = z.infer<typeof assessmentSearchSchema>;
export type AssessmentStats = z.infer<typeof assessmentStatsSchema>;
export type AssessmentCategory = z.infer<typeof assessmentCategorySchema>;
export type AssessmentSkill = z.infer<typeof assessmentSkillSchema>;
export type AssessmentBundle = z.infer<typeof assessmentBundleSchema>;
export type AssessmentSchedule = z.infer<typeof assessmentScheduleSchema>;
export type AssessmentFeedback = z.infer<typeof assessmentFeedbackSchema>;
export type AssessmentDraft = z.infer<typeof assessmentDraftSchema>;

// Validation functions
export const validateAssessment = (data: unknown) => {
  return assessmentSchema.safeParse(data);
};

export const validateAssessmentUpdate = (data: unknown) => {
  return assessmentUpdateSchema.safeParse(data);
};

export const validateAssessmentAttempt = (data: unknown) => {
  return assessmentAttemptSchema.safeParse(data);
};

export const validateQuestion = (data: unknown) => {
  return simpleQuestionSchema.safeParse(data);
};

export const validateBadge = (data: unknown) => {
  return badgeSchema.safeParse(data);
};

// Helper schemas for specific use cases
export const assessmentBasicInfoSchema = assessmentSchema.pick({
  title: true,
  description: true,
  skillName: true,
  level: true,
  price: true,
  duration: true,
  passingScore: true,
});

export const assessmentQuestionsSchema = z.object({
  questions: z.array(simpleQuestionSchema).min(1),
});

export const assessmentBadgesSchema = z.object({
  badges: z.array(badgeSchema).optional(),
});

export const assessmentPricingSchema = z.object({
  price: z.number().min(0),
  isPremium: z.boolean().optional(),
});

export const assessmentMetadataSchema = z.object({
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});