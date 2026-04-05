'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  FolderOpen,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  PenSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils/cn';
import { useProfile } from '@/hooks/useProfile'; // ✅ Add this import

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  role: 'student' | 'company' | 'mentor' | 'founder' | 'admin';
  className?: string;
}

const getSidebarConfig = (role: string): SidebarSection[] => {
  const commonSections: SidebarSection[] = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', href: `/dashboard/${role}`, icon: Home },
        { title: 'Profile', href: `/dashboard/${role}/profile`, icon: Users },
        { title: 'Messages', href: `/dashboard/${role}/messages`, icon: MessageSquare, badge: 3 },
        { title: 'Notifications', href: `/dashboard/${role}/notifications`, icon: Bell, badge: 5 },
      ],
    },
  ];

  const roleSpecificSections: Record<string, SidebarSection[]> = {
    student: [
      {
        title: 'Growth',
        items: [
          { title: 'Projects', href: '/dashboard/student/projects', icon: Briefcase, badge: 2 },
          { title: 'Assessments', href: '/dashboard/student/assessments', icon: Award },
          { title: 'Jobs', href: '/dashboard/student/jobs', icon: TrendingUp },
          { title: 'Learn', href: '/dashboard/student/learn', icon: BookOpen },
          { title: 'Mentors', href: '/dashboard/student/mentors', icon: Users },
        ],
      },
      {
        title: 'Community',
        items: [
          { title: 'Feed', href: '/dashboard/student/community', icon: MessageSquare },
          { title: 'Events', href: '/dashboard/student/events', icon: Calendar },
        ],
      },
    ],
    company: [
      {
        title: 'Company',
        items: [
          { title: 'Dashboard Home', href: '/dashboard/company', icon: Home },
          { title: 'Post New Project', href: '/dashboard/company/post-project', icon: PenSquare },
          { title: 'My Projects', href: '/dashboard/company/my-projects', icon: FolderOpen, badge: 3 },
          { title: 'Applications', href: '/dashboard/company/applications', icon: UserPlus, badge: 8 },
          { title: 'Jobs', href: '/dashboard/company/jobs', icon: Briefcase },
          { title: 'Talent Search', href: '/dashboard/company/talent-search', icon: Users },
          { title: 'Company Profile', href: '/dashboard/company/profile', icon: Building },
          { title: 'Analytics', href: '/dashboard/company/analytics', icon: BarChart3 },
          { title: 'Team Management', href: '/dashboard/company/team', icon: Users },
          { title: 'Billing & Payments', href: '/dashboard/company/billing', icon: DollarSign },
        ],
      },
    ],
    mentor: [
      {
        title: 'Mentorship',
        items: [
          { title: 'Sessions', href: '/dashboard/mentor/sessions', icon: Calendar, badge: 2 },
          { title: 'Students', href: '/dashboard/mentor/students', icon: Users, badge: 12 },
          { title: 'Earnings', href: '/dashboard/mentor/earnings', icon: DollarSign },
          { title: 'Reviews', href: '/dashboard/mentor/reviews', icon: Star },
        ],
      },
      {
        title: 'Content',
        items: [
          { title: 'Resources', href: '/dashboard/mentor/resources', icon: BookOpen },
          { title: 'Analytics', href: '/dashboard/mentor/analytics', icon: TrendingUp },
        ],
      },
    ],
    founder: [
      {
        title: 'Startup',
        items: [
          { title: 'Startup Profile', href: '/dashboard/founder/startup', icon: Building },
          { title: 'Co-founder Match', href: '/dashboard/founder/cofounder-match', icon: Users, badge: 2 },
          { title: 'Team Building', href: '/dashboard/founder/team-building', icon: UserPlus },
          { title: 'Investors', href: '/dashboard/founder/investors', icon: Target },
        ],
      },
    ],
    admin: [
      {
        title: 'Operations',
        items: [
          { title: 'Users', href: '/dashboard/admin/users', icon: Users, badge: 24 },
          { title: 'Projects', href: '/dashboard/admin/projects', icon: Briefcase },
          { title: 'Assessments', href: '/dashboard/admin/assessments', icon: Award },
          { title: 'Payments', href: '/dashboard/admin/payments', icon: DollarSign },
          { title: 'Reports', href: '/dashboard/admin/reports', icon: AlertCircle, badge: 3 },
        ],
      },
      {
        title: 'Governance',
        items: [
          { title: 'Moderation', href: '/dashboard/admin/moderation', icon: MessageSquare, badge: 7 },
          { title: 'Disputes', href: '/dashboard/admin/projects/disputes', icon: AlertCircle },
        ],
      },
    ],
  };

  return [
    ...commonSections,
    ...(roleSpecificSections[role] || []),
    {
      title: 'Preferences',
      items: [
        { title: 'Settings', href: `/dashboard/${role}/settings`, icon: Settings },
        { title: 'Help', href: '/help', icon: HelpCircle },
      ],
    },
  ];
};

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();
  // ✅ Remove useSession, add useProfile
  const { profile } = useProfile();
  const sections = getSidebarConfig(role);
  
  // ✅ Get name from profile instead of session
  const displayName = profile?.name || 'User';
  const displayEmail = profile?.email || 'user@example.com';
  const companyName = role === 'company' ? displayName || 'Your Company' : displayName;

  return (
    <aside
      className={cn(
        'glass-card fixed inset-y-3 left-3 z-40 hidden w-[290px] overflow-hidden rounded-[32px] lg:block',
        className
      )}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-white/45 px-6 pb-5 pt-6 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-info-500 to-secondary-500 text-sm font-bold text-white">
              IH
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.28em] text-charcoal-900 dark:text-white">
                InternHub
              </div>
              <div className="text-xs text-charcoal-500 dark:text-charcoal-400">Premium workspace</div>
            </div>
          </Link>

          <div className="glass-card mt-5 rounded-[26px] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-charcoal-400 dark:text-charcoal-400">Signed in as</p>
            <p className="mt-2 text-sm font-semibold text-charcoal-900 dark:text-white">{displayName}</p>
            <p className="mt-1 truncate text-xs text-charcoal-500 dark:text-charcoal-400">{displayEmail}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full bg-secondary-50 px-3 py-1 text-xs font-semibold capitalize text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-200">
                {role}
              </div>
              {role === 'company' && (
                <div className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950/30 dark:text-info-300">
                  Verified
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          {sections.map((section) => (
            <div key={section.title} className="mb-7 last:mb-0">
              <h4 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-charcoal-400 dark:text-charcoal-400">
                {section.title}
              </h4>
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r from-primary-700 to-info-600 text-white shadow-[0_18px_42px_-24px_rgba(52,74,134,0.85)]'
                          : 'text-charcoal-700 hover:bg-card/80 hover:text-primary-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800/75 dark:hover:text-info-300'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-2xl transition',
                          isActive
                            ? 'bg-card/14 text-white'
                            : 'bg-card/65 text-charcoal-700 group-hover:bg-primary-50 group-hover:text-primary-700 dark:bg-charcoal-900/65 dark:text-charcoal-200 dark:group-hover:bg-charcoal-900 dark:group-hover:text-info-300'
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="flex-1 font-medium">{item.title}</span>
                      {item.badge ? (
                        <Badge
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            isActive
                              ? 'bg-card/16 text-white'
                              : 'bg-secondary-100 text-secondary-900 dark:bg-secondary-900/25 dark:text-secondary-200'
                          )}
                        >
                          {item.badge}
                        </Badge>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/45 p-4 dark:border-white/10">
          <ThemeToggle className="mb-3 w-full" />
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}