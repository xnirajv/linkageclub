import type { User } from './user';

export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectVisibility = 'public' | 'private' | 'invite';
export type BudgetType = 'fixed' | 'hourly' | 'milestone';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'any';
export type LocationType = 'remote' | 'onsite' | 'hybrid';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interview_completed' | 'interview_cancelled' | 'accepted' | 'rejected' | 'withdrawn';

export interface ProjectSkill {
  name: string;
  level: ExperienceLevel;
  mandatory: boolean;
}

export interface ProjectBudget {
  type: BudgetType;
  min: number;
  max: number;
  currency: string;
}

export interface ProjectLocation {
  type: LocationType;
  label?: string;
}

export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  deadline: number;
  status: MilestoneStatus;
  feedback?: string;
  filesRequired?: boolean;
  deliverables?: string[];
  completedAt?: Date | string;
  approvedAt?: Date | string;
  order?: number;
}

export interface ProjectApplication {
  _id?: string;
  userId: string;
  applicantId?: {
    _id: string;
    name: string;
    avatar?: string;
    trustScore?: number;
    skills?: Array<{ name: string; level: string; verified?: boolean }>;
    location?: string;
  };
  projectId: string;
  proposedAmount: number;
  proposedDuration: number;
  coverLetter: string;
  attachments: string[];
  status: ApplicationStatus;
  submittedAt: Date | string;
  reviewedAt?: Date | string;
  reviewNotes?: string;
}

export interface ProjectReview {
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
}

export interface Project {
  _id: string;
  title: string;
  summary?: string;
  description: string;
  companyId: string | { _id: string; name: string; avatar?: string; companyName?: string };
  category: string;
  skills: ProjectSkill[];
  budget: ProjectBudget;
  duration: number;
  location?: ProjectLocation;
  milestones: Milestone[];
  requirements: string[];
  experienceLevel: ExperienceLevel;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  attachments: string[];
  isFeatured: boolean;
  applications: ProjectApplication[];
  applicationsCount: number;
  selectedApplicant?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  reviews: ProjectReview[];
  tags: string[];
  views: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  company?: { _id: string; name: string; avatar?: string; companyName?: string };
  matchScore?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  userAttempt?: {
    score: number;
    passed: boolean;
    completedAt?: Date | string;
  };
}

export interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  category?: string;
  skills?: string[];
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string;
  status?: string;
  search?: string;
}

export interface CreateProjectPayload {
  title: string;
  summary?: string;
  description: string;
  category: string;
  skills: Array<{ name: string; level: string; mandatory: boolean }>;
  budget: { type: string; min: number; max: number; currency: string };
  duration: number;
  location?: { type: LocationType; label?: string };
  requirements: string[];
  experienceLevel: string;
  visibility: ProjectVisibility;
  attachments?: string[];
  isFeatured?: boolean;
  milestones?: Array<{ title: string; description?: string; amount: number; deadline: number }>;
}

export interface ApplyToProjectPayload {
  proposedAmount: number;
  proposedDuration: number;
  coverLetter: string;
  attachments?: string[];
  portfolio?: string;
  additionalInfo?: string;
}

function getResolvedCompany(project: Project): User | undefined {
  if (project.company) return project.company as unknown as User;
  if (typeof project.companyId !== 'string') return project.companyId as unknown as User;
  return undefined;
}

export function getCompanyName(project: Project): string {
  const company = getResolvedCompany(project);
  if (!company) return 'Company';
  return (company as any).companyName || company.name || 'Company';
}

export function getCompanyAvatar(project: Project): string | undefined {
  return getResolvedCompany(project)?.avatar;
}

export function getCompanyId(project: Project): string {
  if (typeof project.companyId === 'string') return project.companyId;
  return (project.companyId as any)?._id || '';
}