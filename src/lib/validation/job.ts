import { z } from 'zod';

// Job type enum
export const jobTypeEnum = z.enum(['full-time', 'part-time', 'internship', 'contract', 'remote']);

// Experience level enum
export const experienceLevelEnum = z.enum(['fresher', 'junior', 'mid', 'senior', 'lead']);

// Salary period enum
export const salaryPeriodEnum = z.enum(['hour', 'month', 'year']);

// Job status enum
export const jobStatusEnum = z.enum(['draft', 'published', 'closed', 'filled']);

// Skill requirement schema
export const jobSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  mandatory: z.boolean().default(true),
  yearsRequired: z.number().min(0).optional(),
});

// Experience requirement schema
export const jobExperienceBaseSchema = z.object({
  min: z.number().min(0, 'Minimum experience cannot be negative'),
  max: z.number().min(0, 'Maximum experience cannot be negative'),
  level: experienceLevelEnum,
});

export const jobExperienceSchema = jobExperienceBaseSchema.refine((data) => data.max >= data.min, {
  message: 'Maximum experience must be greater than or equal to minimum',
  path: ['max'],
});

// Salary schema
export const jobSalaryBaseSchema = z.object({
  min: z.number().min(0, 'Minimum salary cannot be negative'),
  max: z.number().min(0, 'Maximum salary cannot be negative'),
  currency: z.string().default('INR'),
  period: salaryPeriodEnum.default('year'),
  negotiable: z.boolean().default(false),
});

export const jobSalarySchema = jobSalaryBaseSchema.refine((data) => data.max >= data.min, {
  message: 'Maximum salary must be greater than or equal to minimum',
  path: ['max'],
});

// Location schema
export const jobLocationSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  remote: z.boolean().default(false),
  address: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode').optional(),
});

// Application question schema
export const jobQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  type: z.enum(['text', 'multiple-choice', 'yes-no']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

// Job posting schema
export const jobSchema = z.object({
  title: z.string()
    .min(5, 'Job title must be at least 5 characters')
    .max(100, 'Job title must not exceed 100 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  responsibilities: z.array(z.string())
    .min(1, 'At least one responsibility is required'),
  requirements: z.array(z.string())
    .min(1, 'At least one requirement is required'),
  preferredQualifications: z.array(z.string()).optional(),
  
  location: z.union([jobLocationSchema, z.string()]),
  type: jobTypeEnum,
  
  experience: jobExperienceSchema,
  salary: jobSalarySchema,
  
  skills: z.array(jobSkillSchema).min(1, 'At least one skill is required'),
  benefits: z.array(z.string()).optional(),
  
  department: z.string().optional(),
  openings: z.number().min(1, 'At least 1 opening is required').max(100, 'Cannot exceed 100 openings'),
  
  questions: z.array(jobQuestionSchema).optional(),
  
  postedBy: z.string().optional(),
  deadline: z.string().optional(),
  
  status: jobStatusEnum.default('draft'),
  isVerified: z.boolean().default(false),
  
  tags: z.array(z.string()).optional(),
});

// Job update schema (all fields optional)
export const jobUpdateSchema = jobSchema.partial();

// Job application schema
export const jobApplicationSchema = z.object({
  jobId: z.string(),
  resume: z.string().url('Please upload a valid resume'),
  coverLetter: z.string().max(2000, 'Cover letter is too long').optional(),
  answers: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  expectedSalary: z.number().min(0).optional(),
  startDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// Job search filters
export const jobSearchSchema = z.object({
  query: z.string().optional(),
  type: z.array(jobTypeEnum).optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  minSalary: z.number().min(0).optional(),
  maxSalary: z.number().min(0).optional(),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional(),
  department: z.string().optional(),
  companyId: z.string().optional(),
  postedAfter: z.string().optional(),
  postedBefore: z.string().optional(),
  sortBy: z.enum(['relevance', 'date', 'salary', 'experience']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Job statistics schema
export const jobStatsSchema = z.object({
  totalApplications: z.number(),
  views: z.number(),
  saves: z.number(),
  shares: z.number(),
  averageMatchScore: z.number().min(0).max(100).optional(),
  applicationByDay: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })).optional(),
  topSkills: z.array(z.object({
    skill: z.string(),
    count: z.number(),
  })).optional(),
});

// Job draft schema
export const jobDraftSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  location: z.union([jobLocationSchema, z.string()]).optional(),
  type: jobTypeEnum.optional(),
  experience: jobExperienceBaseSchema.partial().optional(),
  salary: jobSalaryBaseSchema.partial().optional(),
  skills: z.array(jobSkillSchema).optional(),
  benefits: z.array(z.string()).optional(),
  department: z.string().optional(),
  openings: z.number().min(1).optional(),
  questions: z.array(jobQuestionSchema).optional(),
  lastSaved: z.date().optional(),
});

// Job alert schema
export const jobAlertSchema = z.object({
  userId: z.string(),
  name: z.string().min(3, 'Alert name is required'),
  filters: jobSearchSchema,
  frequency: z.enum(['daily', 'weekly', 'instant']),
  active: z.boolean().default(true),
  email: z.boolean().default(true),
  push: z.boolean().default(false),
  createdAt: z.date().optional(),
});

// Job bookmark schema
export const jobBookmarkSchema = z.object({
  jobId: z.string(),
  userId: z.string(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
});

// Job recommendation schema
export const jobRecommendationSchema = z.object({
  jobId: z.string(),
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
});

// Type exports
export type JobType = z.infer<typeof jobTypeEnum>;
export type ExperienceLevel = z.infer<typeof experienceLevelEnum>;
export type SalaryPeriod = z.infer<typeof salaryPeriodEnum>;
export type JobStatus = z.infer<typeof jobStatusEnum>;
export type JobSkill = z.infer<typeof jobSkillSchema>;
export type JobExperience = z.infer<typeof jobExperienceSchema>;
export type JobSalary = z.infer<typeof jobSalarySchema>;
export type JobLocation = z.infer<typeof jobLocationSchema>;
export type JobQuestion = z.infer<typeof jobQuestionSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobUpdate = z.infer<typeof jobUpdateSchema>;
export type JobApplication = z.infer<typeof jobApplicationSchema>;
export type JobSearch = z.infer<typeof jobSearchSchema>;
export type JobStats = z.infer<typeof jobStatsSchema>;
export type JobDraft = z.infer<typeof jobDraftSchema>;
export type JobAlert = z.infer<typeof jobAlertSchema>;
export type JobBookmark = z.infer<typeof jobBookmarkSchema>;
export type JobRecommendation = z.infer<typeof jobRecommendationSchema>;

// Validation functions
export const validateJob = (data: unknown) => {
  return jobSchema.safeParse(data);
};

export const validateJobUpdate = (data: unknown) => {
  return jobUpdateSchema.safeParse(data);
};

export const validateJobApplication = (data: unknown) => {
  return jobApplicationSchema.safeParse(data);
};

export const validateJobSearch = (data: unknown) => {
  return jobSearchSchema.safeParse(data);
};

// Helper schemas for specific use cases
export const jobBasicInfoSchema = jobSchema.pick({
  title: true,
  type: true,
  location: true,
  department: true,
  openings: true,
});

export const jobDescriptionSchema = jobSchema.pick({
  description: true,
  responsibilities: true,
  requirements: true,
  preferredQualifications: true,
});

export const jobCompensationSchema = z.object({
  salary: jobSalarySchema,
  benefits: z.array(z.string()).optional(),
});

export const jobRequirementsSchema = z.object({
  experience: jobExperienceSchema,
  skills: z.array(jobSkillSchema),
});

export const jobApplicationQuestionsSchema = z.object({
  questions: z.array(jobQuestionSchema).optional(),
});

// Remote job specific schema
export const remoteJobSchema = jobSchema.extend({
  location: jobLocationSchema.extend({
    remote: z.literal(true),
  }),
  timezone: z.string().optional(),
  workingHours: z.string().optional(),
});

// Internship specific schema
export const internshipSchema = jobSchema.extend({
  type: z.literal('internship'),
  duration: z.number().min(1).max(12).optional(),
  stipend: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    period: z.enum(['month', 'year']),
  }).optional(),
  academicCredit: z.boolean().optional(),
  ppo: z.boolean().optional(),
});
