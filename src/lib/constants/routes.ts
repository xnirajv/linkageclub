export const routes = {
  // Public routes
  home: '/',
  about: '/about',
  contact: '/contact',
  pricing: '/pricing',
  help: '/help',
  blog: '/blog',
  
  // Auth routes
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  
  // Main feature routes
  projects: '/projects',
  jobs: '/jobs',
  mentors: '/mentors',
  community: '/community',
  assessments: '/assessments',
  
  // Dashboard routes
  dashboard: {
    student: {
      root: '/dashboard/student',
      projects: '/dashboard/student/projects',
      jobs: '/dashboard/student/jobs',
      mentors: '/dashboard/student/mentors',
      assessments: '/dashboard/student/assessments',
      community: '/dashboard/student/community',
      learn: '/dashboard/student/learn',
      profile: '/dashboard/student/profile',
      settings: '/dashboard/student/settings',
    },
    company: {
      root: '/dashboard/company',
      jobs: '/dashboard/company/jobs',
      projects: '/dashboard/company/projects',
      applications: '/dashboard/company/applications',
      talentSearch: '/dashboard/company/talent-search',
      analytics: '/dashboard/company/analytics',
      profile: '/dashboard/company/profile',
      settings: '/dashboard/company/settings',
    },
    mentor: {
      root: '/dashboard/mentor',
      sessions: '/dashboard/mentor/sessions',
      students: '/dashboard/mentor/students',
      resources: '/dashboard/mentor/resources',
      earnings: '/dashboard/mentor/earnings',
      availability: '/dashboard/mentor/availability',
      profile: '/dashboard/mentor/profile',
      settings: '/dashboard/mentor/settings',
    },
    founder: {
      root: '/dashboard/founder',
      startup: '/dashboard/founder/startup',
      cofounderMatch: '/dashboard/founder/cofounder-match',
      teamBuilding: '/dashboard/founder/team-building',
      investors: '/dashboard/founder/investors',
      settings: '/dashboard/founder/settings',
    },
    admin: {
      root: '/dashboard/admin',
      users: '/dashboard/admin/users',
      projects: '/dashboard/admin/projects',
      payments: '/dashboard/admin/payments',
      moderation: '/dashboard/admin/moderation',
      analytics: '/dashboard/admin/analytics',
      assessments: '/dashboard/admin/assessments',
      settings: '/dashboard/admin/settings',
    },
  },
  
  // API routes
  api: {
    auth: {
      login: '/api/auth/signin',
      logout: '/api/auth/signout',
      signup: '/api/auth/signup',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      verifyEmail: '/api/auth/verify-email',
      resendVerification: '/api/auth/resend-verification',
    },
    projects: {
      list: '/api/projects',
      create: '/api/projects',
      get: (id: string) => `/api/projects/${id}`,
      update: (id: string) => `/api/projects/${id}`,
      delete: (id: string) => `/api/projects/${id}`,
      apply: (id: string) => `/api/projects/${id}/apply`,
      applications: (id: string) => `/api/projects/${id}/applications`,
      milestones: (id: string) => `/api/projects/${id}/milestones`,
      submit: (id: string) => `/api/projects/${id}/submit`,
    },
    jobs: {
      list: '/api/jobs',
      create: '/api/jobs',
      get: (id: string) => `/api/jobs/${id}`,
      update: (id: string) => `/api/jobs/${id}`,
      delete: (id: string) => `/api/jobs/${id}`,
      apply: (id: string) => `/api/jobs/${id}/apply`,
      save: (id: string) => `/api/jobs/${id}/save`,
      applications: (id: string) => `/api/jobs/${id}/applications`,
    },
    mentors: {
      list: '/api/mentors',
      get: (id: string) => `/api/mentors/${id}`,
      book: (id: string) => `/api/mentors/${id}/book`,
      availability: (id: string) => `/api/mentors/${id}/availability`,
      reviews: (id: string) => `/api/mentors/${id}/reviews`,
      sessions: (id: string) => `/api/mentors/${id}/sessions`,
    },
    assessments: {
      list: '/api/assessments',
      get: (id: string) => `/api/assessments/${id}`,
      start: (id: string) => `/api/assessments/${id}/start`,
      submit: (id: string) => `/api/assessments/${id}/submit`,
      results: (id: string) => `/api/assessments/${id}/results`,
    },
    applications: {
      list: '/api/applications',
      get: (id: string) => `/api/applications/${id}`,
      updateStatus: (id: string) => `/api/applications/${id}/status`,
      withdraw: (id: string) => `/api/applications/${id}/withdraw`,
      message: (id: string) => `/api/applications/${id}/message`,
    },
    payments: {
      createOrder: '/api/payments/create-order',
      verify: '/api/payments/verify',
      refund: (id: string) => `/api/payments/${id}/refund`,
      withdraw: '/api/payments/withdraw',
      transactions: '/api/payments/transactions',
      balance: '/api/payments/balance',
    },
    users: {
      profile: '/api/users/profile',
      update: '/api/users/profile',
      get: (id: string) => `/api/users/${id}`,
      skills: '/api/users/skills',
      badges: '/api/users/badges',
      settings: '/api/users/settings',
    },
    community: {
      posts: '/api/community/posts',
      createPost: '/api/community/posts',
      getPost: (id: string) => `/api/community/posts/${id}`,
      like: (id: string) => `/api/community/posts/${id}/like`,
      comment: (id: string) => `/api/community/posts/${id}/comment`,
      report: (id: string) => `/api/community/posts/${id}/report`,
    },
    notifications: {
      list: '/api/notifications',
      markRead: (id: string) => `/api/notifications/${id}`,
      markAllRead: '/api/notifications/read-all',
      unreadCount: '/api/notifications/unread-count',
      preferences: '/api/notifications/preferences',
    },
    search: {
      global: '/api/search/global',
      jobs: '/api/search/jobs',
      projects: '/api/search/projects',
      users: '/api/search/users',
      suggestions: '/api/search/suggestions',
    },
    uploads: {
      image: '/api/uploads/image',
      document: '/api/uploads/document',
      resume: '/api/uploads/resume',
    },
    ai: {
      recommendations: {
        jobs: '/api/ai/recommend/jobs',
        projects: '/api/ai/recommend/projects',
        mentors: '/api/ai/recommend/mentors',
      },
      parseResume: '/api/ai/parse-resume',
      match: '/api/ai/match',
      trustScore: '/api/ai/trust-score',
    },
  },
  
  // Legal routes
  legal: {
    privacy: '/legal/privacy',
    terms: '/legal/terms',
    refund: '/legal/refund',
  },
};

export const publicRoutes = [
  routes.home,
  routes.about,
  routes.contact,
  routes.pricing,
  routes.help,
  routes.blog,
  routes.login,
  routes.signup,
  routes.forgotPassword,
  routes.resetPassword,
  routes.verifyEmail,
  routes.legal.privacy,
  routes.legal.terms,
  routes.legal.refund,
  routes.projects,
  routes.jobs,
  routes.mentors,
];

export const authRoutes = [
  routes.login,
  routes.signup,
  routes.forgotPassword,
  routes.resetPassword,
  routes.verifyEmail,
];

export const protectedRoutes = [
  '/dashboard',
  '/api/users',
  '/api/applications',
  '/api/payments',
];

export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname === route);
}

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export function getDashboardRoute(role: string): string {
  switch (role) {
    case 'student':
      return routes.dashboard.student.root;
    case 'company':
      return routes.dashboard.company.root;
    case 'mentor':
      return routes.dashboard.mentor.root;
    case 'founder':
      return routes.dashboard.founder.root;
    case 'admin':
      return routes.dashboard.admin.root;
    default:
      return routes.home;
  }
}