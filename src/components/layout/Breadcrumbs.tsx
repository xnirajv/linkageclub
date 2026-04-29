'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  company: 'Company',
  student: 'Student',
  mentor: 'Mentor',
  founder: 'Founder',
  admin: 'Admin',
  projects: 'Projects',
  'my-projects': 'My Projects',
  'post-project': 'Post Project',
  applications: 'Applications',
  jobs: 'Jobs',
  post: 'Post Job',
  'talent-search': 'Talent Search',
  saved: 'Saved',
  profile: 'Profile',
  edit: 'Edit',
  analytics: 'Analytics',
  team: 'Team',
  billing: 'Billing',
  settings: 'Settings',
  notifications: 'Notifications',
  messages: 'Messages',
  manage: 'Manage',
  insights: 'Insights',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 2) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 px-4 md:px-6 py-2 border-t border-gray-100 dark:border-gray-800/50 overflow-x-auto">
      <Link href="/dashboard" className="hover:text-gray-700 dark:hover:text-white transition-colors flex-shrink-0">
        <Home className="h-3 w-3" />
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        const label = labels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
        
        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            {isLast ? (
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gray-700 dark:hover:text-white transition-colors truncate">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}