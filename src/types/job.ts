import { User } from './user';

export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote';
export type JobStatus = 'draft' | 'published' | 'closed' | 'filled';
export type ExperienceLevel = 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
export type SalaryPeriod = 'month' | 'year' | 'hour';

export interface JobSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  mandatory: boolean;
}

export interface JobExperience {
  min: number;
  max: number;
  level: ExperienceLevel;
}

export interface JobSalary {
  min: number;
  max: number;
  currency: string;
  period: SalaryPeriod;
}

export interface JobApplication {
  userId: string;
  resume: string;
  coverLetter?: string;
  answers?: Array<{ question: string; answer: string }>;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: Date;
  reviewedAt?: Date;
  notes?: string;
}

export interface JobQuestion {
  question: string;
  type: 'text' | 'multiple-choice' | 'yes-no';
  options?: string[];
  required: boolean;
}

export interface Job {
  _id: string;
  title: string;
  companyId: User | string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications?: string[];
  location: string;
  type: JobType;
  experience: JobExperience;
  salary: JobSalary;
  skills: JobSkill[];
  benefits: string[];
  department?: string;
  openings: number;
  applications: JobApplication[];
  questions?: JobQuestion[];
  postedBy: string;
  postedAt: Date;
  deadline?: Date;
  status: JobStatus;
  views: number;
  applicationsCount: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  company?: User;
  matchScore?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export type IJob = Job;
