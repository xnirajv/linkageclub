'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ElementType;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  assessments: 'Assessments',
  jobs: 'Jobs',
  learn: 'Learning',
  mentors: 'Mentors',
  community: 'Community',
  profile: 'Profile',
  settings: 'Settings',
  analytics: 'Analytics',
  applications: 'Applications',
  sessions: 'Sessions',
  earnings: 'Earnings',
  'my-applications': 'My Applications',
  'active-projects': 'Active Projects',
  'completed-projects': 'Completed Projects',
  'my-badges': 'My Badges',
  'talent-search': 'Talent Search',
  'post-project': 'Post Project',
  'company-profile': 'Company Profile',
  'mentor-profile': 'Mentor Profile',
  'startup-profile': 'Startup Profile',
  'cofounder-match': 'Co-founder Match',
  'team-building': 'Team Building',
};

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Try to get a user-friendly label
      let label = routeLabels[path] || path;
      
      // Handle dynamic routes (like [id])
      if (path.startsWith('[') && path.endsWith(']')) {
        label = 'Details';
      }

      // Handle numeric IDs
      if (/^\d+$/.test(path)) {
        label = `Item ${path}`;
      }

      breadcrumbs.push({
        label,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 rounded-full border border-white/55 bg-card/72 px-4 py-2 text-sm shadow-[0_18px_52px_-32px_rgba(75,73,69,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-charcoal-900/72">
        {showHome && (
          <li>
            <Link
              href="/"
              className="text-charcoal-500 transition hover:text-primary-700 dark:text-charcoal-400 dark:hover:text-info-300"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {showHome && breadcrumbs.length > 0 && (
          <li className="text-charcoal-300 dark:text-charcoal-300">{separator}</li>
        )}

        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={item.href}>
              <li>
                {isLast ? (
                  <span className="flex items-center rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-950/40 dark:text-info-300">
                    {Icon && <Icon className="mr-1 h-4 w-4" />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center rounded-full px-2 py-1 text-sm text-charcoal-500 transition hover:bg-card/70 hover:text-primary-700 dark:text-charcoal-400 dark:hover:bg-charcoal-800 dark:hover:text-info-300"
                  >
                    {Icon && <Icon className="mr-1 h-4 w-4" />}
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li className="text-charcoal-300 dark:text-charcoal-300">{separator}</li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
