'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const labels: Record<string, string> = {
  dashboard: 'Dashboard', company: 'Company', student: 'Student',
  projects: 'Projects', assessments: 'Assessments', jobs: 'Jobs',
  applications: 'Applications', profile: 'Profile', settings: 'Settings',
  analytics: 'Analytics', billing: 'Billing', team: 'Team',
  'post-project': 'Post Project', 'my-projects': 'My Projects',
  'talent-search': 'Talent Search', notifications: 'Notifications',
  messages: 'Messages', manage: 'Manage', edit: 'Edit',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 px-6 py-2">
      <Link href="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/');
        const isLast = i === segments.length - 1;
        const label = labels[seg] || seg;
        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gray-900 dark:hover:text-white transition-colors truncate">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}