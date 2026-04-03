import { z } from 'zod';

// Application type enum
export const applicationTypeEnum = z.enum(['project', 'job']);

// Application status enum
export const applicationStatusEnum = z.enum([
  'pending',
  'reviewed',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
]);

// Interview type enum
export const interviewTypeEnum = z.enum(['video', 'phone', 'in-person']);

// Interview status enum
export const interviewStatusEnum = z.enum(['scheduled', 'completed', 'cancelled', 'rescheduled']);

// Application question answer schema
export const applicationAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  type: z.enum(['text', 'multiple-choice', 'yes-no']).optional(),
});

// Application message schema
export const applicationMessageSchema = z.object({
  senderId: z.string(),
  content: z.string().min(1, 'Message cannot be empty'),
  attachments: z.array(z.string()).optional(),
  read: z.boolean().default(false),
  readAt: z.date().optional(),
});

// Interview schema
export const interviewSchema = z.object({
  scheduled: z.boolean().default(true),
  date: z.string(),
  type: interviewTypeEnum,
  link: z.string().url('Please enter a valid meeting link').optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  status: interviewStatusEnum.default('scheduled'),
  duration: z.number().min(15).max(180).optional(),
  interviewer: z.string().optional(),
  attendees: z.array(z.string()).optional(),
});

// Project application specific schema
export const projectApplicationSchema = z.object({
  projectId: z.string(),
  applicantId: z.string(),
  proposedAmount: z.number().min(0, 'Proposed amount is required'),
  proposedDuration: z.number().min(1, 'Proposed duration is required'),
  coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters'),
  attachments: z.array(z.string()).optional(),
  answers: z.array(applicationAnswerSchema).optional(),
  availability: z.string().optional(),
  portfolio: z.string().url('Please enter a valid portfolio URL').optional(),
});

// Job application specific schema
export const jobApplicationSchema = z.object({
  jobId: z.string(),
  applicantId: z.string(),
  resume: z.string().url('Please upload a valid resume'),
  coverLetter: z.string().max(2000).optional(),
  answers: z.array(applicationAnswerSchema).optional(),
  expectedSalary: z.number().min(0).optional(),
  startDate: z.string().optional(),
  noticePeriod: z.number().min(0).max(90).optional(),
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
});

// Combined application schema
export const applicationSchema = z.object({
  type: applicationTypeEnum,
  
  // Common fields
  applicantId: z.string(),
  companyId: z.string(),
  
  // Project specific
  projectId: z.string().optional(),
  proposedAmount: z.number().min(0).optional(),
  proposedDuration: z.number().min(1).optional(),
  
  // Job specific
  jobId: z.string().optional(),
  resume: z.string().url().optional(),
  
  // Common application fields
  coverLetter: z.string().max(2000).optional(),
  attachments: z.array(z.string()).optional(),
  answers: z.array(applicationAnswerSchema).optional(),
  
  // Status
  status: applicationStatusEnum.default('pending'),
  
  // Review
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
  reviewNotes: z.string().optional(),
  
  // Interview
  interview: interviewSchema.optional(),
  
  // Communication
  messages: z.array(applicationMessageSchema).optional(),
  
  // Metadata
  submittedAt: z.string().optional(),
  lastUpdated: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
}).refine((data) => {
  // Ensure either projectId or jobId is present based on type
  if (data.type === 'project') {
    return data.projectId && !data.jobId;
  }
  if (data.type === 'job') {
    return data.jobId && !data.projectId;
  }
  return false;
}, {
  message: 'Invalid application type',
  path: ['type'],
});

// Application update schema
export const applicationUpdateSchema = z.object({
  status: applicationStatusEnum.optional(),
  reviewNotes: z.string().optional(),
  interview: interviewSchema.optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().optional(),
});

// Application status update schema
export const applicationStatusUpdateSchema = z.object({
  status: applicationStatusEnum,
  notes: z.string().optional(),
  sendNotification: z.boolean().default(true),
});

// Application filter schema
export const applicationFilterSchema = z.object({
  type: applicationTypeEnum.optional(),
  status: z.array(applicationStatusEnum).optional(),
  projectId: z.string().optional(),
  jobId: z.string().optional(),
  applicantId: z.string().optional(),
  companyId: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['submittedAt', 'status', 'reviewedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Application statistics schema
export const applicationStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  reviewed: z.number(),
  shortlisted: z.number(),
  accepted: z.number(),
  rejected: z.number(),
  withdrawn: z.number(),
  byType: z.object({
    project: z.number().optional(),
    job: z.number().optional(),
  }).optional(),
  byDate: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })).optional(),
});

// Application review schema
export const applicationReviewSchema = z.object({
  applicationId: z.string(),
  reviewerId: z.string(),
  decision: z.enum(['shortlist', 'reject', 'accept']),
  notes: z.string().max(500).optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  sendEmail: z.boolean().default(true),
});

// Application note schema
export const applicationNoteSchema = z.object({
  applicationId: z.string(),
  authorId: z.string(),
  content: z.string().min(1).max(1000),
  isPrivate: z.boolean().default(true),
  attachments: z.array(z.string()).optional(),
});

// Application timeline event schema
export const applicationTimelineSchema = z.object({
  applicationId: z.string(),
  event: z.enum([
    'submitted',
    'viewed',
    'reviewed',
    'shortlisted',
    'rejected',
    'accepted',
    'withdrawn',
    'interview_scheduled',
    'interview_completed',
    'message_sent',
  ]),
  description: z.string(),
  userId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string(),
});

// Application export schema
export const applicationExportSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']),
  fields: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.string(),
    to: z.string(),
  }).optional(),
  status: z.array(applicationStatusEnum).optional(),
  type: applicationTypeEnum.optional(),
});

// Application template schema (for recurring applications)
export const applicationTemplateSchema = z.object({
  name: z.string().min(3, 'Template name is required'),
  type: applicationTypeEnum,
  coverLetter: z.string().optional(),
  answers: z.array(applicationAnswerSchema).optional(),
  attachments: z.array(z.string()).optional(),
  isDefault: z.boolean().default(false),
});

// Application scorecard schema (for evaluating applications)
export const applicationScorecardSchema = z.object({
  applicationId: z.string(),
  reviewerId: z.string(),
  criteria: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(10),
    weight: z.number().min(0).max(100),
    comments: z.string().optional(),
  })),
  totalScore: z.number(),
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']),
  notes: z.string().optional(),
});

// Type exports
export type ApplicationType = z.infer<typeof applicationTypeEnum>;
export type ApplicationStatus = z.infer<typeof applicationStatusEnum>;
export type InterviewType = z.infer<typeof interviewTypeEnum>;
export type InterviewStatus = z.infer<typeof interviewStatusEnum>;
export type ApplicationAnswer = z.infer<typeof applicationAnswerSchema>;
export type ApplicationMessage = z.infer<typeof applicationMessageSchema>;
export type Interview = z.infer<typeof interviewSchema>;
export type ProjectApplication = z.infer<typeof projectApplicationSchema>;
export type JobApplication = z.infer<typeof jobApplicationSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;
export type ApplicationStatusUpdate = z.infer<typeof applicationStatusUpdateSchema>;
export type ApplicationFilter = z.infer<typeof applicationFilterSchema>;
export type ApplicationStats = z.infer<typeof applicationStatsSchema>;
export type ApplicationReview = z.infer<typeof applicationReviewSchema>;
export type ApplicationNote = z.infer<typeof applicationNoteSchema>;
export type ApplicationTimeline = z.infer<typeof applicationTimelineSchema>;
export type ApplicationExport = z.infer<typeof applicationExportSchema>;
export type ApplicationTemplate = z.infer<typeof applicationTemplateSchema>;
export type ApplicationScorecard = z.infer<typeof applicationScorecardSchema>;

// Validation functions
export const validateApplication = (data: unknown) => {
  return applicationSchema.safeParse(data);
};

export const validateProjectApplication = (data: unknown) => {
  return projectApplicationSchema.safeParse(data);
};

export const validateJobApplication = (data: unknown) => {
  return jobApplicationSchema.safeParse(data);
};

export const validateApplicationStatusUpdate = (data: unknown) => {
  return applicationStatusUpdateSchema.safeParse(data);
};

export const validateInterview = (data: unknown) => {
  return interviewSchema.safeParse(data);
};

// Helper schemas
export const applicationSubmissionSchema = z.discriminatedUnion('type', [
  projectApplicationSchema.extend({ type: z.literal('project') }),
  jobApplicationSchema.extend({ type: z.literal('job') }),
]);

export const applicationQuickReviewSchema = z.object({
  applicationId: z.string(),
  decision: z.enum(['shortlist', 'reject']),
  notes: z.string().optional(),
});

export const applicationBatchActionSchema = z.object({
  applicationIds: z.array(z.string()),
  action: z.enum(['shortlist', 'reject', 'delete', 'export']),
  reason: z.string().optional(),
});

// Status-specific validation
export const applicationRejectSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason'),
  feedback: z.string().optional(),
  sendEmail: z.boolean().default(true),
});

export const applicationAcceptSchema = z.object({
  message: z.string().optional(),
  nextSteps: z.string().optional(),
  sendContract: z.boolean().default(false),
  startDate: z.string().optional(),
});

export const applicationShortlistSchema = z.object({
  notes: z.string().optional(),
  nextAction: z.enum(['interview', 'review', 'contact']).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});