export const roles = {
  student: {
    value: 'student',
    label: 'Student',
    description: 'Learn, build projects, and find opportunities',
    permissions: [
      'apply_to_projects',
      'apply_to_jobs',
      'book_mentors',
      'take_assessments',
      'create_posts',
      'comment_on_posts',
    ],
  },
  company: {
    value: 'company',
    label: 'Company',
    description: 'Post jobs and hire talented students',
    permissions: [
      'post_jobs',
      'post_projects',
      'review_applications',
      'message_applicants',
      'view_talent_pool',
      'access_analytics',
    ],
  },
  mentor: {
    value: 'mentor',
    label: 'Mentor',
    description: 'Share knowledge and guide students',
    permissions: [
      'create_sessions',
      'share_resources',
      'view_student_profiles',
      'receive_payments',
      'manage_availability',
    ],
  },
  founder: {
    value: 'founder',
    label: 'Founder',
    description: 'Build your startup team',
    permissions: [
      'post_jobs',
      'find_cofounders',
      'build_team',
      'pitch_investors',
      'access_startup_resources',
    ],
  },
  admin: {
    value: 'admin',
    label: 'Admin',
    description: 'Manage the platform',
    permissions: [
      'manage_users',
      'manage_content',
      'view_analytics',
      'moderate_posts',
      'manage_payments',
      'manage_settings',
      'create_assessments',
      'verify_users',
    ],
  },
} as const;

export const roleColors = {
  student: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  company: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  mentor: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  founder: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  admin: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
} as const;

export type Role = keyof typeof roles;
export type Permission = typeof roles[Role]['permissions'][number];

export function hasPermission(role: Role, permission: string): boolean {
  return (roles[role]?.permissions as readonly string[]).includes(permission);
}

export function getRoleConfig(role: Role) {
  return roles[role];
}

export function getRoleColor(role: Role) {
  return roleColors[role];
}
