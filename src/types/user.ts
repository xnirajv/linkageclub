export type UserRole = 'student' | 'company' | 'mentor' | 'founder' | 'admin';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  level: SkillLevel;
  verified: boolean;
  verifiedAt?: Date;
  title?:string;
}

export interface Badge {
  name: string;
  description: string;
  image: string;
  earnedAt: Date;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserVerification {
  email: boolean;
  phone: boolean;
  id: boolean;
  linkedin: boolean;
  github: boolean;
}

export interface UserStats {
  projectsCompleted: number;
  totalEarnings: number;
  averageRating: number;
  reviewsCount: number;
  sessionsAttended: number;
  daysActive: number;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  emailVerified: boolean;
  trustScore: number;
  skills: Skill[];
  badges: Badge[];
  socialLinks: SocialLinks;
  preferences: UserPreferences;
  verification: UserVerification;
  stats: UserStats;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Company specific
  companyName?: string;
  isVerified?: boolean;
  logo?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: string | number;
  companyType?: string;
  
  // Mentor specific
  hourlyRate?: number;
  availability?: any;
  
  // Founder specific
  startupName?: string;
  startupStage?: string;
  tagline?: string;
  foundedDate?: string | Date;
  stage?: string;
  teamSize?: string | number;
  fundingRaised?: string | number;
  fundingStage?: string;
  problemStatement?: string;
  solution?: string;
  targetMarket?: string;
  businessModel?: string;
  competitiveAdvantage?: string;
  teamMembers?: any[];
  investors?: any[];
  milestones?: any[];
  lookingFor?: string[];

  // Student specific
  expectedCTC?: string | number;
  
  // For relationships
  savedJobs?: string[];
  savedProjects?: string[];
  savedPosts?: string[];
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
    trustScore: number;
  };
  expires: string;
}

export type IUser = User;
