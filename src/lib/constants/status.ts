export const projectStatus = {
  draft: {
    value: 'draft',
    label: 'Draft',
    description: 'Project is being prepared',
    color: 'gray',
  },
  open: {
    value: 'open',
    label: 'Open',
    description: 'Accepting applications',
    color: 'green',
  },
  in_progress: {
    value: 'in_progress',
    label: 'In Progress',
    description: 'Project is active',
    color: 'blue',
  },
  review: {
    value: 'review',
    label: 'Under Review',
    description: 'Work is being reviewed',
    color: 'yellow',
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    description: 'Project is finished',
    color: 'purple',
  },
  cancelled: {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Project was cancelled',
    color: 'red',
  },
  disputed: {
    value: 'disputed',
    label: 'Disputed',
    description: 'There is a dispute',
    color: 'orange',
  },
} as const;

export const applicationStatus = {
  pending: {
    value: 'pending',
    label: 'Pending',
    description: 'Application submitted',
    color: 'yellow',
  },
  shortlisted: {
    value: 'shortlisted',
    label: 'Shortlisted',
    description: 'Application shortlisted',
    color: 'blue',
  },
  interview: {
    value: 'interview',
    label: 'Interview',
    description: 'Interview scheduled',
    color: 'purple',
  },
  accepted: {
    value: 'accepted',
    label: 'Accepted',
    description: 'Application accepted',
    color: 'green',
  },
  rejected: {
    value: 'rejected',
    label: 'Rejected',
    description: 'Application rejected',
    color: 'red',
  },
  withdrawn: {
    value: 'withdrawn',
    label: 'Withdrawn',
    description: 'Application withdrawn',
    color: 'gray',
  },
} as const;

export const jobStatus = {
  draft: {
    value: 'draft',
    label: 'Draft',
    color: 'gray',
  },
  active: {
    value: 'active',
    label: 'Active',
    color: 'green',
  },
  paused: {
    value: 'paused',
    label: 'Paused',
    color: 'yellow',
  },
  closed: {
    value: 'closed',
    label: 'Closed',
    color: 'red',
  },
  filled: {
    value: 'filled',
    label: 'Filled',
    color: 'purple',
  },
} as const;

export const paymentStatus = {
  pending: {
    value: 'pending',
    label: 'Pending',
    description: 'Payment initiated',
    color: 'yellow',
  },
  processing: {
    value: 'processing',
    label: 'Processing',
    description: 'Payment being processed',
    color: 'blue',
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    description: 'Payment successful',
    color: 'green',
  },
  failed: {
    value: 'failed',
    label: 'Failed',
    description: 'Payment failed',
    color: 'red',
  },
  refunded: {
    value: 'refunded',
    label: 'Refunded',
    description: 'Payment refunded',
    color: 'purple',
  },
  disputed: {
    value: 'disputed',
    label: 'Disputed',
    description: 'Payment disputed',
    color: 'orange',
  },
} as const;

export const sessionStatus = {
  scheduled: {
    value: 'scheduled',
    label: 'Scheduled',
    color: 'blue',
  },
  ongoing: {
    value: 'ongoing',
    label: 'Ongoing',
    color: 'green',
  },
  completed: {
    value: 'completed',
    label: 'Completed',
    color: 'purple',
  },
  cancelled: {
    value: 'cancelled',
    label: 'Cancelled',
    color: 'red',
  },
  rescheduled: {
    value: 'rescheduled',
    label: 'Rescheduled',
    color: 'yellow',
  },
} as const;

export const assessmentStatus = {
  not_started: {
    value: 'not_started',
    label: 'Not Started',
    color: 'gray',
  },
  in_progress: {
    value: 'in_progress',
    label: 'In Progress',
    color: 'blue',
  },
  submitted: {
    value: 'submitted',
    label: 'Submitted',
    color: 'yellow',
  },
  passed: {
    value: 'passed',
    label: 'Passed',
    color: 'green',
  },
  failed: {
    value: 'failed',
    label: 'Failed',
    color: 'red',
  },
} as const;

export const verificationStatus = {
  pending: {
    value: 'pending',
    label: 'Pending',
    color: 'yellow',
  },
  verified: {
    value: 'verified',
    label: 'Verified',
    color: 'green',
  },
  rejected: {
    value: 'rejected',
    label: 'Rejected',
    color: 'red',
  },
} as const;

export const moderationStatus = {
  pending: {
    value: 'pending',
    label: 'Pending Review',
    color: 'yellow',
  },
  approved: {
    value: 'approved',
    label: 'Approved',
    color: 'green',
  },
  rejected: {
    value: 'rejected',
    label: 'Rejected',
    color: 'red',
  },
  flagged: {
    value: 'flagged',
    label: 'Flagged',
    color: 'orange',
  },
} as const;

export type ProjectStatus = keyof typeof projectStatus;
export type ApplicationStatus = keyof typeof applicationStatus;
export type JobStatus = keyof typeof jobStatus;
export type PaymentStatus = keyof typeof paymentStatus;
export type SessionStatus = keyof typeof sessionStatus;
export type AssessmentStatus = keyof typeof assessmentStatus;
export type VerificationStatus = keyof typeof verificationStatus;
export type ModerationStatus = keyof typeof moderationStatus;

export function getStatusColor(status: string, type: 'project' | 'application' | 'job' | 'payment' | 'session' | 'assessment' | 'verification' | 'moderation'): string {
  const statusMap = {
    project: projectStatus,
    application: applicationStatus,
    job: jobStatus,
    payment: paymentStatus,
    session: sessionStatus,
    assessment: assessmentStatus,
    verification: verificationStatus,
    moderation: moderationStatus,
  };

  return (statusMap[type][status as keyof typeof statusMap[typeof type]] as any)?.color || 'gray';
}