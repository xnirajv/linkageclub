import { z } from 'zod';

// Project status enum
export const projectStatusEnum = z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']);

// Project visibility enum
export const projectVisibilityEnum = z.enum(['public', 'private', 'invite']);

// Budget type enum
export const budgetTypeEnum = z.enum(['fixed', 'hourly', 'milestone']);

// Experience level enum
export const projectExperienceEnum = z.enum(['beginner', 'intermediate', 'advanced', 'any']);

// Skill level enum
export const skillLevelEnum = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

// Project skill schema
export const projectSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: skillLevelEnum,
  mandatory: z.boolean().default(true),
  yearsRequired: z.number().min(0).optional(),
});

// Budget schema
export const projectBudgetBaseSchema = z.object({
  type: budgetTypeEnum,
  min: z.number().min(0, 'Minimum budget cannot be negative'),
  max: z.number().min(0, 'Maximum budget cannot be negative'),
  currency: z.string().default('INR'),
  isNegotiable: z.boolean().default(false),
});

export const projectBudgetSchema = projectBudgetBaseSchema.refine((data) => data.max >= data.min, {
  message: 'Maximum budget must be greater than or equal to minimum',
  path: ['max'],
});

// Milestone schema
export const projectMilestoneSchema = z.object({
  title: z.string().min(3, 'Milestone title is required'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  deadline: z.number().min(1, 'Deadline must be at least 1 day'),
  deliverables: z.array(z.string()).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'approved']).default('pending'),
});

// Project requirements schema
export const projectRequirementSchema = z.object({
  description: z.string().min(5, 'Requirement description is required'),
  type: z.enum(['must-have', 'nice-to-have']).default('must-have'),
});

// Project location schema
export const projectLocationSchema = z.object({
  type: z.enum(['remote', 'onsite', 'hybrid']).default('remote'),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
});

// Project timeline schema
export const projectTimelineSchema = z.object({
  startDate: z.string().optional(),
  estimatedEndDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  totalDays: z.number().min(1).max(365),
  flexible: z.boolean().default(false),
});

// Project application schema
export const projectApplicationSchema = z.object({
  projectId: z.string(),
  freelancerId: z.string(),
  proposedAmount: z.number().min(0, 'Proposed amount is required'),
  proposedDuration: z.number().min(1, 'Proposed duration is required'),
  coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters'),
  attachments: z.array(z.string()).optional(),
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  availability: z.string().optional(),
});

// Project review schema
export const projectReviewSchema = z.object({
  projectId: z.string(),
  reviewerId: z.string(),
  revieweeId: z.string(),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(500, 'Review is too long'),
  communication: z.number().min(1).max(5).optional(),
  quality: z.number().min(1).max(5).optional(),
  timeliness: z.number().min(1).max(5).optional(),
  wouldHireAgain: z.boolean().optional(),
});

// Project creation schema
export const projectSchema = z.object({
  title: z.string()
    .min(5, 'Project title must be at least 5 characters')
    .max(100, 'Project title must not exceed 100 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  
  skills: z.array(projectSkillSchema).min(1, 'At least one skill is required'),
  
  budget: projectBudgetSchema,
  
  timeline: projectTimelineSchema,
  
  experienceLevel: projectExperienceEnum,
  
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  
  milestones: z.array(projectMilestoneSchema).optional(),
  
  location: projectLocationSchema.optional(),
  
  attachments: z.array(z.string()).optional(),
  
  questions: z.array(z.object({
    question: z.string(),
    required: z.boolean().default(true),
  })).optional(),
  
  visibility: projectVisibilityEnum.default('public'),
  
  status: projectStatusEnum.default('draft'),
  
  tags: z.array(z.string()).optional(),
  
  isUrgent: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

// Project update schema (all fields optional)
export const projectUpdateSchema = projectSchema.partial();

// Project search filters
export const projectSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  skills: z.array(z.string()).optional(),
  minBudget: z.number().min(0).optional(),
  maxBudget: z.number().min(0).optional(),
  experienceLevel: projectExperienceEnum.optional(),
  duration: z.number().min(1).optional(),
  status: projectStatusEnum.optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  urgent: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  postedAfter: z.string().optional(),
  postedBefore: z.string().optional(),
  sortBy: z.enum(['relevance', 'budget', 'duration', 'date', 'applications']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Project statistics schema
export const projectStatsSchema = z.object({
  totalApplications: z.number(),
  views: z.number(),
  saves: z.number(),
  shares: z.number(),
  averageBid: z.number().optional(),
  minBid: z.number().optional(),
  maxBid: z.number().optional(),
  applicationByDay: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })).optional(),
  topSkills: z.array(z.object({
    skill: z.string(),
    count: z.number(),
  })).optional(),
});

// Project milestone update schema
export const milestoneUpdateSchema = z.object({
  milestoneId: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'approved']),
  feedback: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  completionDate: z.string().optional(),
});

// Project submission schema (for freelancer)
export const projectSubmissionSchema = z.object({
  milestoneId: z.string(),
  work: z.string().min(10, 'Please describe your work'),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
  hoursSpent: z.number().min(0).optional(),
});

// Project feedback schema (for client)
export const projectFeedbackSchema = z.object({
  milestoneId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().max(500).optional(),
  approve: z.boolean(),
  comments: z.string().optional(),
  requestChanges: z.string().optional(),
});

// Project draft schema
export const projectDraftSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  skills: z.array(projectSkillSchema).optional(),
  budget: projectBudgetBaseSchema.partial().optional(),
  timeline: projectTimelineSchema.partial().optional(),
  experienceLevel: projectExperienceEnum.optional(),
  requirements: z.array(z.string()).optional(),
  milestones: z.array(projectMilestoneSchema).optional(),
  lastSaved: z.date().optional(),
});

// Project invitation schema
export const projectInvitationSchema = z.object({
  projectId: z.string(),
  freelancerId: z.string(),
  message: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
});

// Project contract schema
export const projectContractSchema = z.object({
  projectId: z.string(),
  freelancerId: z.string(),
  terms: z.string().min(50, 'Contract terms are required'),
  startDate: z.string(),
  endDate: z.string(),
  paymentTerms: z.string(),
  intellectualProperty: z.string().optional(),
  confidentiality: z.boolean().default(true),
  signedByClient: z.boolean().default(false),
  signedByFreelancer: z.boolean().default(false),
  signedAt: z.string().optional(),
});

// Project dispute schema
export const projectDisputeSchema = z.object({
  projectId: z.string(),
  raisedBy: z.string(),
  reason: z.string().min(10, 'Please explain the dispute reason'),
  description: z.string().min(20, 'Please provide more details'),
  evidence: z.array(z.string()).optional(),
  desiredResolution: z.string(),
  status: z.enum(['pending', 'investigating', 'resolved', 'rejected']).default('pending'),
});

// Type exports
export type ProjectStatus = z.infer<typeof projectStatusEnum>;
export type ProjectVisibility = z.infer<typeof projectVisibilityEnum>;
export type BudgetType = z.infer<typeof budgetTypeEnum>;
export type ProjectExperience = z.infer<typeof projectExperienceEnum>;
export type SkillLevel = z.infer<typeof skillLevelEnum>;
export type ProjectSkill = z.infer<typeof projectSkillSchema>;
export type ProjectBudget = z.infer<typeof projectBudgetSchema>;
export type ProjectMilestone = z.infer<typeof projectMilestoneSchema>;
export type ProjectTimeline = z.infer<typeof projectTimelineSchema>;
export type ProjectLocation = z.infer<typeof projectLocationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type ProjectApplication = z.infer<typeof projectApplicationSchema>;
export type ProjectReview = z.infer<typeof projectReviewSchema>;
export type ProjectSearch = z.infer<typeof projectSearchSchema>;
export type ProjectStats = z.infer<typeof projectStatsSchema>;
export type ProjectDraft = z.infer<typeof projectDraftSchema>;
export type ProjectInvitation = z.infer<typeof projectInvitationSchema>;
export type ProjectContract = z.infer<typeof projectContractSchema>;
export type ProjectDispute = z.infer<typeof projectDisputeSchema>;
export type MilestoneUpdate = z.infer<typeof milestoneUpdateSchema>;
export type ProjectSubmission = z.infer<typeof projectSubmissionSchema>;
export type ProjectFeedback = z.infer<typeof projectFeedbackSchema>;

// Validation functions
export const validateProject = (data: unknown) => {
  return projectSchema.safeParse(data);
};

export const validateProjectUpdate = (data: unknown) => {
  return projectUpdateSchema.safeParse(data);
};

export const validateProjectApplication = (data: unknown) => {
  return projectApplicationSchema.safeParse(data);
};

export const validateProjectSearch = (data: unknown) => {
  return projectSearchSchema.safeParse(data);
};

export const validateMilestoneUpdate = (data: unknown) => {
  return milestoneUpdateSchema.safeParse(data);
};

// Helper schemas for specific use cases
export const projectBasicInfoSchema = projectSchema.pick({
  title: true,
  category: true,
  experienceLevel: true,
  visibility: true,
});

export const projectBudgetInfoSchema = z.object({
  budget: projectBudgetSchema,
  timeline: projectTimelineSchema,
});

export const projectRequirementsSchema = z.object({
  skills: z.array(projectSkillSchema),
  requirements: z.array(z.string()),
});

export const projectMilestonesSchema = z.object({
  milestones: z.array(projectMilestoneSchema),
});

// Fixed price project specific schema
export const fixedPriceProjectSchema = projectSchema.extend({
  budget: projectBudgetBaseSchema.extend({
    type: z.literal('fixed'),
  }),
});

// Hourly project specific schema
export const hourlyProjectSchema = projectSchema.extend({
  budget: projectBudgetBaseSchema.extend({
    type: z.literal('hourly'),
    hoursPerWeek: z.number().min(1).max(40).optional(),
  }),
});

// Milestone-based project specific schema
export const milestoneProjectSchema = projectSchema.extend({
  budget: projectBudgetBaseSchema.extend({
    type: z.literal('milestone'),
  }),
  milestones: z.array(projectMilestoneSchema).min(1, 'At least one milestone is required'),
});
