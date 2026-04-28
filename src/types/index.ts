// Export all types from individual files
export * from './user';
export * from './mentor';
export * from './assessment';
export * from './community';
export * from './notification';
export * from './message';
export * from './api';

// Resolve ApplicationStatus ambiguity between project.ts and application.ts
export type { ApplicationStatus } from './project';

// Export project types (exclude conflicting ApplicationStatus)
export type {
  ProjectStatus,
  ProjectVisibility,
  BudgetType,
  ExperienceLevel,
  LocationType,
  MilestoneStatus,
  ProjectSkill,
  ProjectBudget,
  ProjectLocation,
  Milestone,
  ProjectApplication,
  ProjectReview,
  Project,
  ProjectsResponse,
  ProjectFilters,
  CreateProjectPayload,
  ApplyToProjectPayload,
} from './project';

export { getCompanyName, getCompanyAvatar, getCompanyId } from './project';

// Export application types
export * from './application';

// Re-export common types
export type ID = string;

export type Timestamps = {
  createdAt: Date;
  updatedAt: Date;
};

export type SoftDelete = {
  isDeleted: boolean;
  deletedAt?: Date;
};

export type Status = 'active' | 'inactive' | 'pending' | 'deleted';

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface Image {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface FileAttachment {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface MetaData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

export interface Rating {
  average: number;
  count: number;
  distribution?: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface Price {
  amount: number;
  currency: string;
  discounted?: number;
}

export interface Period {
  start: Date;
  end: Date;
}

export interface Contact {
  email?: string;
  phone?: string;
  website?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
    instagram?: string;
  };
}