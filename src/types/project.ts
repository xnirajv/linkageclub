import { User } from './user';

export type ProjectStatus = 'active' | 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectVisibility = 'public' | 'private' | 'invite';
export type BudgetType = 'fixed' | 'hourly' | 'milestone';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'any';

export interface ProjectSkill {
  name: string;
  level: ExperienceLevel;
  mandatory: boolean;
}

export interface Budget {
  type: BudgetType;
  min: number;
  max: number;
  currency: string;
}

export interface Milestone {
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  deadline: number;
  feedback?: string;
  filesRequired?: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  submissions?: Array<{
    work: string;
    attachments: string[];
    submittedAt: Date;
  }>;
}

export interface ProjectApplication {
  userId: string;
  proposedAmount: number;
  proposedDuration: number;
  coverLetter: string;
  attachments: string[];
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface ProjectReview {
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Project {
  _id: string;
  title: string;
  summary?: string;
  description: string;
  companyId: string | User;
  category: string;
  skills: ProjectSkill[];
  budget: Budget;
  duration: number;
  location?: {
    type: 'remote' | 'onsite' | 'hybrid';
    label?: string;
  };
  deadline?: string;
  milestones: Milestone[];
  requirements: string[];
  experienceLevel: ExperienceLevel;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  attachments: string[];
  isFeatured: boolean;
  applications: ProjectApplication[];
  selectedApplicant?: string;
  startDate?: Date;
  endDate?: Date;
  reviews: ProjectReview[];
  tags: string[];
  views: number;
  teamSize?: number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
  company?: User;
  matchScore?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export type IProject = Project;

function getResolvedCompany(project: Project): User | undefined {
  if (project.company) {
    return project.company;
  }

  if (project.companyId && typeof project.companyId !== 'string') {
    return project.companyId;
  }

  return undefined;
}

export function getCompanyName(project: Project): string {
  const company = getResolvedCompany(project);
  if (company) {
    return company.companyName || company.name || 'Company';
  }
  return 'Company';
}

export function getCompanyAvatar(project: Project): string | undefined {
  return getResolvedCompany(project)?.avatar;
}

export function getCompanyId(project: Project): string {
  if (typeof project.companyId === 'string') {
    return project.companyId;
  }
  return project.companyId?._id || '';
}
