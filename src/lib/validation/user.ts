import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(100, 'Email must not exceed 100 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(50, 'Password must not exceed 50 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number')
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// User registration schema
export const userRegistrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['student', 'company', 'mentor', 'founder']),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Student registration schema
export const studentRegistrationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  college: z.string().optional(),
  graduationYear: z.string().regex(/^\d{4}$/, 'Please enter a valid year').optional(),
  degree: z.string().min(1, 'Degree is required').optional(),
  yearOfStudy: z.enum(['1st', '2nd', '3rd', '4th', 'graduate']).optional(),
  skills: z.array(z.string()).optional(),
  linkedin: urlSchema,
  github: urlSchema,
  portfolio: urlSchema,
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
  updatesAccepted: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Company registration schema
export const companyRegistrationSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  website: z.string().url('Please enter a valid website URL'),
  industry: z.string().min(1, 'Please select an industry'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  foundedYear: z.string().regex(/^\d{4}$/, 'Please enter a valid year'),
  linkedin: urlSchema,
  twitter: urlSchema,
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Mentor registration schema
export const mentorRegistrationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  currentRole: z.string().min(2, 'Current role is required'),
  currentCompany: z.string().min(2, 'Company name is required'),
  expertise: z.array(z.string()).min(3, 'Add at least 3 areas of expertise'),
  yearsOfExperience: z.string(),
  hourlyRate: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 500, 'Minimum rate is ₹500/hour'),
  bio: z.string().min(200, 'Bio must be at least 200 characters'),
  linkedin: z.string().url('Please enter a valid LinkedIn URL'),
  github: urlSchema,
  portfolio: urlSchema,
  availability: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Founder registration schema
export const founderRegistrationSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  
  confirmPassword: z.string(),
  startupName: z.string().min(2, 'Startup name is required'),
  startupStage: z.string(),
  industry: z.string(),
  lookingFor: z.array(z.string()).min(1, 'Select at least one option'),
  cofounderRole: z.string().optional(),
  startupDescription: z.string().min(100, 'Description must be at least 100 characters'),
  website: urlSchema,
  linkedin: urlSchema,
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  location: z.string().max(100, 'Location must not exceed 100 characters').optional(),
  phone: phoneSchema,
  avatar: z.string().optional(),
  socialLinks: z.object({
    linkedin: urlSchema,
    github: urlSchema,
    portfolio: urlSchema,
    twitter: urlSchema,
  }).partial().optional(),
});

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Email change schema
export const emailChangeSchema = z.object({
  newEmail: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Skill schema
export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  yearsOfExperience: z.number().min(0).max(50).optional(),
});

// Address schema
export const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode').optional(),
});

// Education schema
export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  grade: z.string().optional(),
});

// Experience schema
export const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
});

// Project schema
export const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  budget: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
  }),
  duration: z.number().min(1).max(365),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

// Job schema
export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string(),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract', 'remote']),
  experience: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    level: z.enum(['fresher', 'junior', 'mid', 'senior', 'lead']),
  }),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default('INR'),
    period: z.enum(['month', 'year', 'hour']).default('year'),
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

// Assessment schema
export const assessmentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  skillName: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  price: z.number().min(0),
  duration: z.number().min(5).max(180),
  passingScore: z.number().min(50).max(90),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).min(2),
    correctAnswer: z.number().min(0),
    explanation: z.string().optional(),
    points: z.number().min(1).default(1),
  })).min(1),
});

// Message schema
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long'),
  attachments: z.array(z.string()).optional(),
});

// Review schema
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review is too long'),
});

// Payment method schema
export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'upi', 'bank']),
  cardNumber: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  upiId: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  accountHolderName: z.string().optional(),
});

// Withdrawal schema
export const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal amount is ₹100'),
  method: z.enum(['bank', 'upi']),
  accountDetails: z.object({
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    accountHolderName: z.string().optional(),
    upiId: z.string().optional(),
  }),
});

// Search filters schema
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  type: z.array(z.string()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  categories: z.object({
    applications: z.boolean(),
    messages: z.boolean(),
    payments: z.boolean(),
    projects: z.boolean(),
    sessions: z.boolean(),
    marketing: z.boolean(),
  }),
});

// Type exports
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
export type CompanyRegistrationInput = z.infer<typeof companyRegistrationSchema>;
export type MentorRegistrationInput = z.infer<typeof mentorRegistrationSchema>;
export type FounderRegistrationInput = z.infer<typeof founderRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type AssessmentInput = z.infer<typeof assessmentSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;