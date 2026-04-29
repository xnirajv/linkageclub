'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  PenSquare, FolderOpen, UserPlus, Briefcase,
  Search, Building, BarChart3, Users, DollarSign, Bell,
  MessageSquare, Settings, LogOut, Sparkles, ChevronLeft, ChevronRight,
  Home, FileText, CreditCard, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';

interface SidebarProps {
  role: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

const menuConfig: Record<string, Array<{ href: string; label: string; icon: React.ElementType; badge?: string }>> = {
  student: [
    { href: '/dashboard/student', label: 'Overview', icon: Home },
    { href: '/dashboard/student/projects', label: 'Projects', icon: Briefcase },
    { href: '/dashboard/student/assessments', label: 'Assessments', icon: FileText },
    { href: '/dashboard/student/jobs', label: 'Jobs', icon: TrendingUp },
    { href: '/dashboard/student/learn', label: 'Learn', icon: FileText },
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
    { href: '/dashboard/company/profile', label: 'Company Profile', icon: Building },
    { href: '/dashboard/company/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/dashboard/company/team', label: 'Team', icon: Users },
    { href: '/dashboard/company/billing', label: 'Billing', icon: DollarSign },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/company/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/company/settings', label: 'Settings', icon: Settings },
  ],
  mentor: [
    { href: '/dashboard/mentor', label: 'Overview', icon: Home },
    { href: '/dashboard/mentor/sessions', label: 'Sessions', icon: FileText },
    { href: '/dashboard/mentor/students', label: 'Students', icon: Users },
    { href: '/dashboard/mentor/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/dashboard/mentor/resources', label: 'Resources', icon: FileText },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/mentor/settings', label: 'Settings', icon: Settings },
  ],
  founder: [
    { href: '/dashboard/founder', label: 'Overview', icon: Home },
    { href: '/dashboard/founder/startup', label: 'Startup', icon: TrendingUp },
    { href: '/dashboard/founder/cofounder-match', label: 'Co-Founder Match', icon: UserPlus },
    { href: '/dashboard/founder/team-building', label: 'Team Building', icon: Users },
    { href: '/dashboard/founder/investors', label: 'Investors', icon: DollarSign },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/founder/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', icon: Home },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/projects', label: 'Projects', icon: Briefcase },
    { href: '/dashboard/admin/assessments', label: 'Assessments', icon: FileText },
    { href: '/dashboard/admin/payments', label: 'Payments', icon: DollarSign },
    { href: '/dashboard/admin/moderation', label: 'Moderation', icon: FileText },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ],
};

export function Sidebar({ role, collapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const links = menuConfig[role] || menuConfig.student;
  const name = profile?.name || 'Company';
  const email = profile?.email || '';
  const initials = name.charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === `/dashboard/${role}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen flex flex-col bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
      collapsed ? 'w-[72px]' : 'w-[260px]'
    )}>
      {/* Logo + Brand */}
      <div className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800 gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-sm tracking-tight whitespace-nowrap text-gray-900 dark:text-white">InternHub</span>
              <p className="text-[10px] text-gray-400 -mt-0.5 capitalize">{role} Portal</p>
            </div>
          )}
        </Link>
        <button
          onClick={handleToggle}
          className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-gray-500" /> : <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          const hasBadge = link.label === 'Notifications' && unreadCount > 0;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group relative',
                active
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg shadow-gray-900/10'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/80'
              )}
            >
              <Icon className={cn(
                'h-4.5 w-4.5 flex-shrink-0',
                active ? 'text-white dark:text-gray-900' : 'text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
              )} />
              {!collapsed && (
                <>
                  <span className="truncate">{link.label}</span>
                  {hasBadge && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && hasBadge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Pro Tip */}
      {!collapsed && role === 'company' && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
          <p className="text-[11px] font-medium text-blue-700 dark:text-blue-300">💡 Pro Tip</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Verified companies get 3x more applications!</p>
          <button className="mt-2 text-[10px] font-medium text-blue-600 hover:underline">Get Verified →</button>
        </div>
      )}

      {/* User Info + Logout */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3">
        <div className={cn('flex items-center gap-3 px-2 py-1.5', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 dark:from-white dark:to-gray-200 flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate text-gray-900 dark:text-white">{name}</p>
              {email && <p className="text-[10px] text-gray-400 truncate">{email}</p>}
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full flex items-center gap-3 px-2 py-2 mt-1.5 rounded-lg text-[12px] font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
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