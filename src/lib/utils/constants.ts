export const USER_ROLES = {
  STUDENT: 'student',
  COMPANY: 'company',
  MENTOR: 'mentor',
  FOUNDER: 'founder',
  ADMIN: 'admin',
} as const;

export const PROJECT_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const JOB_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  FILLED: 'filled',
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

export const ASSESSMENT_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export const EXPERIENCE_LEVELS = {
  FRESHER: 'fresher',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
} as const;

export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
  REMOTE: 'remote',
} as const;

export const PROJECT_CATEGORIES = {
  WEB_DEVELOPMENT: 'web-development',
  MOBILE_DEVELOPMENT: 'mobile-development',
  AI_ML: 'ai-ml',
  DATA_SCIENCE: 'data-science',
  DEVOPS: 'devops',
  DESIGN: 'design',
  CONTENT_WRITING: 'content-writing',
  MARKETING: 'marketing',
  OTHER: 'other',
} as const;

export const NOTIFICATION_TYPES = {
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_SHORTLISTED: 'application_shortlisted',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  PROJECT_MILESTONE: 'project_milestone',
  PROJECT_COMPLETED: 'project_completed',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_RELEASED: 'payment_released',
  SESSION_SCHEDULED: 'session_scheduled',
  SESSION_REMINDER: 'session_reminder',
  SESSION_COMPLETED: 'session_completed',
  MESSAGE_RECEIVED: 'message_received',
  REVIEW_RECEIVED: 'review_received',
  BADGE_EARNED: 'badge_earned',
  TRUST_SCORE_UPDATED: 'trust_score_updated',
  JOB_ALERT: 'job_alert',
  MENTOR_RECOMMENDATION: 'mentor_recommendation',
  SYSTEM_ALERT: 'system_alert',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  RAZORPAY: 'razorpay',
} as const;

export const CURRENCIES = {
  INR: 'INR',
  USD: 'USD',
} as const;

export const TIMEZONES = {
  IST: 'Asia/Kolkata',
} as const;

export const SKILLS_LIST = [
  'React.js',
  'Node.js',
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'HTML',
  'CSS',
  'MongoDB',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'Git',
  'UI/UX Design',
  'Figma',
  'Adobe XD',
  'Data Science',
  'Machine Learning',
  'Deep Learning',
  'TensorFlow',
  'PyTorch',
  'DevOps',
  'CI/CD',
  'Jenkins',
  'Terraform',
  'Ansible',
  'System Design',
  'Microservices',
  'REST APIs',
  'GraphQL',
  'WebSockets',
  'Redux',
  'Next.js',
  'Vue.js',
  'Angular',
  'Swift',
  'Kotlin',
  'React Native',
  'Flutter',
  'Django',
  'Flask',
  'Spring Boot',
  '.NET',
  'PHP',
  'Laravel',
  'Ruby on Rails',
  'Go',
  'Rust',
  'Blockchain',
  'Smart Contracts',
  'Solidity',
  'Web3',
  'Cybersecurity',
  'Network Security',
  'Penetration Testing',
  'Project Management',
  'Agile',
  'Scrum',
  'Product Management',
  'Digital Marketing',
  'SEO',
  'Content Writing',
  'Copywriting',
  'Technical Writing',
] as const;

export const INDUSTRIES = [
  'Technology',
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'Marketplace',
  'AI/ML',
  'CleanTech',
  'Media & Entertainment',
  'Gaming',
  'Travel',
  'Food Tech',
  'Logistics',
  'Real Estate',
  'Consulting',
  'Manufacturing',
  'Automotive',
  'Aerospace',
  'Defense',
  'Agriculture',
  'Biotech',
  'Pharmaceutical',
  'Energy',
  'Sustainability',
] as const;