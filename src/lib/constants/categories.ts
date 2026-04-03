export const projectCategories = [
  {
    value: 'web-development',
    label: 'Web Development',
    description: 'Web applications, websites, and web services',
    icon: 'Globe',
  },
  {
    value: 'mobile-development',
    label: 'Mobile Development',
    description: 'iOS, Android, and cross-platform mobile apps',
    icon: 'Smartphone',
  },
  {
    value: 'data-science',
    label: 'Data Science & Analytics',
    description: 'Data analysis, machine learning, and AI projects',
    icon: 'BarChart',
  },
  {
    value: 'design',
    label: 'Design',
    description: 'UI/UX, graphic design, and branding',
    icon: 'Palette',
  },
  {
    value: 'devops',
    label: 'DevOps & Cloud',
    description: 'Infrastructure, deployment, and cloud services',
    icon: 'Cloud',
  },
  {
    value: 'blockchain',
    label: 'Blockchain & Web3',
    description: 'Cryptocurrency, NFTs, and decentralized apps',
    icon: 'Link',
  },
  {
    value: 'game-development',
    label: 'Game Development',
    description: 'Video games and interactive experiences',
    icon: 'Gamepad2',
  },
  {
    value: 'iot',
    label: 'IoT & Embedded',
    description: 'Internet of Things and hardware projects',
    icon: 'Cpu',
  },
  {
    value: 'content-writing',
    label: 'Content Writing',
    description: 'Blog posts, articles, and copywriting',
    icon: 'PenTool',
  },
  {
    value: 'marketing',
    label: 'Marketing & Growth',
    description: 'Digital marketing and growth strategies',
    icon: 'TrendingUp',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Projects that don\'t fit other categories',
    icon: 'MoreHorizontal',
  },
] as const;

export const jobCategories = [
  {
    value: 'software-engineering',
    label: 'Software Engineering',
    subcategories: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps'],
  },
  {
    value: 'data-science',
    label: 'Data Science & AI',
    subcategories: ['Data Analyst', 'Data Scientist', 'ML Engineer', 'AI Researcher'],
  },
  {
    value: 'product',
    label: 'Product',
    subcategories: ['Product Manager', 'Product Designer', 'Product Analyst'],
  },
  {
    value: 'design',
    label: 'Design',
    subcategories: ['UI/UX Designer', 'Graphic Designer', 'Motion Designer'],
  },
  {
    value: 'marketing',
    label: 'Marketing',
    subcategories: ['Digital Marketing', 'Content Marketing', 'SEO Specialist', 'Growth'],
  },
  {
    value: 'sales',
    label: 'Sales',
    subcategories: ['Sales Executive', 'Business Development', 'Account Manager'],
  },
  {
    value: 'operations',
    label: 'Operations',
    subcategories: ['Operations Manager', 'Logistics', 'Supply Chain'],
  },
  {
    value: 'customer-success',
    label: 'Customer Success',
    subcategories: ['Customer Support', 'Account Manager', 'Success Manager'],
  },
  {
    value: 'hr',
    label: 'Human Resources',
    subcategories: ['Recruiter', 'HR Manager', 'Talent Acquisition'],
  },
  {
    value: 'finance',
    label: 'Finance & Accounting',
    subcategories: ['Accountant', 'Financial Analyst', 'Controller'],
  },
] as const;

export const communityCategories = [
  {
    value: 'general',
    label: 'General Discussion',
    description: 'General topics and conversations',
    icon: 'MessageSquare',
  },
  {
    value: 'projects',
    label: 'Project Showcase',
    description: 'Share your projects and get feedback',
    icon: 'Briefcase',
  },
  {
    value: 'jobs',
    label: 'Job Opportunities',
    description: 'Discuss job openings and career advice',
    icon: 'Building2',
  },
  {
    value: 'learning',
    label: 'Learning & Resources',
    description: 'Share learning resources and tutorials',
    icon: 'BookOpen',
  },
  {
    value: 'tech',
    label: 'Technology',
    description: 'Latest in tech, tools, and frameworks',
    icon: 'Code',
  },
  {
    value: 'career',
    label: 'Career Advice',
    description: 'Career guidance and professional development',
    icon: 'TrendingUp',
  },
  {
    value: 'freelancing',
    label: 'Freelancing',
    description: 'Tips and discussions about freelancing',
    icon: 'DollarSign',
  },
  {
    value: 'startups',
    label: 'Startups & Entrepreneurship',
    description: 'Building and growing startups',
    icon: 'Rocket',
  },
  {
    value: 'qa',
    label: 'Q&A',
    description: 'Ask and answer questions',
    icon: 'HelpCircle',
  },
] as const;

export const assessmentCategories = [
  {
    value: 'programming',
    label: 'Programming',
    languages: ['JavaScript', 'Python', 'Java', 'C++', 'Go'],
  },
  {
    value: 'web-development',
    label: 'Web Development',
    languages: ['HTML/CSS', 'React', 'Node.js', 'Next.js'],
  },
  {
    value: 'mobile',
    label: 'Mobile Development',
    languages: ['React Native', 'Flutter', 'iOS', 'Android'],
  },
  {
    value: 'data-science',
    label: 'Data Science',
    languages: ['Python', 'R', 'SQL', 'Machine Learning'],
  },
  {
    value: 'devops',
    label: 'DevOps',
    languages: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
  },
  {
    value: 'database',
    label: 'Databases',
    languages: ['SQL', 'MongoDB', 'PostgreSQL', 'Redis'],
  },
  {
    value: 'aptitude',
    label: 'Aptitude',
    languages: ['Logical Reasoning', 'Quantitative', 'Verbal'],
  },
] as const;

export type ProjectCategory = typeof projectCategories[number]['value'];
export type JobCategory = typeof jobCategories[number]['value'];
export type CommunityCategory = typeof communityCategories[number]['value'];
export type AssessmentCategory = typeof assessmentCategories[number]['value'];