'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, PenSquare, FolderOpen, UserPlus, Briefcase,
  Search, Building, BarChart3, Users, DollarSign, Bell,
  MessageSquare, Settings, LogOut, Sparkles, ChevronLeft, ChevronRight,
  Award, BookOpen, TrendingUp, Calendar, Target, AlertCircle,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useProfile } from '@/hooks/useProfile';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  role: string;
}

const menuConfig: Record<string, Array<{ href: string; label: string; icon: React.ElementType }>> = {
  student: [
    { href: '/dashboard/student', label: 'Overview', icon: Home },
    { href: '/dashboard/student/projects', label: 'Projects', icon: Briefcase },
    { href: '/dashboard/student/assessments', label: 'Assessments', icon: Award },
    { href: '/dashboard/student/jobs', label: 'Jobs', icon: TrendingUp },
    { href: '/dashboard/student/learn', label: 'Learn', icon: BookOpen },
    { href: '/dashboard/student/mentors', label: 'Mentors', icon: Users },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/student/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/student/settings', label: 'Settings', icon: Settings },
  ],
  company: [
    { href: '/dashboard/company', label: 'Overview', icon: Home },
    { href: '/dashboard/company/post-project', label: 'Post Project', icon: PenSquare },
    { href: '/dashboard/company/my-projects', label: 'My Projects', icon: FolderOpen },
    { href: '/dashboard/company/applications', label: 'Applications', icon: UserPlus },
    { href: '/dashboard/company/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/dashboard/company/talent-search', label: 'Talent Search', icon: Search },
    { href: '/dashboard/company/profile', label: 'Profile', icon: Building },
    { href: '/dashboard/company/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/company/team', label: 'Team', icon: Users },
    { href: '/dashboard/company/billing', label: 'Billing', icon: DollarSign },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/company/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/company/settings', label: 'Settings', icon: Settings },
  ],
  mentor: [
    { href: '/dashboard/mentor', label: 'Overview', icon: Home },
    { href: '/dashboard/mentor/sessions', label: 'Sessions', icon: Calendar },
    { href: '/dashboard/mentor/students', label: 'Students', icon: Users },
    { href: '/dashboard/mentor/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/dashboard/mentor/resources', label: 'Resources', icon: BookOpen },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/mentor/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', icon: Home },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/projects', label: 'Projects', icon: Briefcase },
    { href: '/dashboard/admin/assessments', label: 'Assessments', icon: Award },
    { href: '/dashboard/admin/payments', label: 'Payments', icon: DollarSign },
    { href: '/dashboard/admin/moderation', label: 'Moderation', icon: AlertCircle },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useProfile();
  const [collapsed, setCollapsed] = React.useState(false);

  const links = menuConfig[role] || menuConfig.student;
  const name = profile?.name || 'User';
  const email = profile?.email || '';
  const initials = name.charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen flex flex-col bg-[#fafafa] dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 transition-all duration-200',
      collapsed ? 'w-[72px]' : 'w-[260px]'
    )}>
      <div className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800 gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div className="w-7 h-7 rounded-md bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white dark:text-black" />
          </div>
          {!collapsed && <span className="font-semibold text-sm tracking-tight whitespace-nowrap">InternHub</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group',
                active
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-gray-900 dark:text-white' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300')} />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <div className={cn('flex items-center gap-2.5 px-2 py-1.5', collapsed && 'justify-center')}>
          <div className="w-7 h-7 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-[10px] font-medium flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate">{name}</p>
              {email && <p className="text-[10px] text-gray-400 truncate">{email}</p>}
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full flex items-center gap-2.5 px-2 py-2 mt-1 rounded-lg text-[12px] text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}