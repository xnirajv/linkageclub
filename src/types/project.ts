import { User } from './user';

export type ProjectStatus = 'active' |'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ProjectVisibility = 'public' | 'private';
export type BudgetType = 'fixed' | 'hourly' | 'milestone';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

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
  deadline: number; // days from start
  feedback?:string;
  filesRequired?:boolean
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
  description: string;
  companyId: User | string;
  category: string;
  skills: ProjectSkill[];
  budget: Budget;
  duration: number;
  deadline?:string;
  milestones: Milestone[];
  requirements: string[];
  experienceLevel: ExperienceLevel;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  applications: ProjectApplication[];
  selectedApplicant?: string;
  startDate?: Date;
  endDate?: Date;
  reviews: ProjectReview[];
  tags: string[];
  views: number;
  teamSize?:number;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  company?: User;
  matchScore?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export type IProject = Project;
