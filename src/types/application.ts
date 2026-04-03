import { User } from './user';
import { Project } from './project';
import { Job } from './job';

export type ApplicationType = 'project' | 'job';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
export type InterviewType = 'video' | 'phone' | 'in-person';

export interface Interview {
  scheduled: boolean;
  date?: Date;
  type?: InterviewType;
  link?: string;
  notes?: string;
  feedback?: string;
  rating?: number;
}

export interface ApplicationMessage {
  _id?: string;
  senderId: string;
  content: string;
  attachments?: string[];
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  
  // Populated fields
  sender?: User;
}

export interface ApplicationAnswer {
  question: string;
  answer: string;
}

export interface Application {
  _id: string;
  type: ApplicationType;
  projectId?: string;
  jobId?: string;
  applicantId: string;
  companyId: string;
  
  // Project specific
  proposedAmount?: number;
  proposedDuration?: number;
  coverLetter: string;
  attachments: string[];
  
  // Job specific
  resume?: string;
  answers?: ApplicationAnswer[];
  
  // Common
  status: ApplicationStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Interview
  interview?: Interview;
  
  // Communication
  messages: ApplicationMessage[];
  
  // Timeline
  submittedAt: Date;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  applicant?: User;
  company?: User;
  project?: Project;
  job?: Job;
}

export type IApplication = Application;
