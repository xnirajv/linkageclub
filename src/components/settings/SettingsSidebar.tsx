'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { User, Bell, Lock, CreditCard, Users, Settings } from 'lucide-react';

interface SettingsLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface SettingsSidebarProps {
  role: 'student' | 'company' | 'mentor' | 'founder' | 'admin';
}

const studentLinks: SettingsLink[] = [
  { href: '/dashboard/student/settings', label: 'Overview', icon: Settings },
  { href: '/dashboard/student/settings/account', label: 'Account', icon: User },
  { href: '/dashboard/student/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/student/settings/privacy', label: 'Privacy', icon: Lock },
  { href: '/dashboard/student/settings/payments', label: 'Payments', icon: CreditCard },
];

const companyLinks: SettingsLink[] = [
  { href: '/dashboard/company/settings', label: 'Overview', icon: Settings },
  { href: '/dashboard/company/settings/team', label: 'Team', icon: Users },
  { href: '/dashboard/company/settings/billing', label: 'Billing', icon: CreditCard },
];

const mentorLinks: SettingsLink[] = [
  { href: '/dashboard/mentor/settings', label: 'Settings', icon: Settings },
];

const founderLinks: SettingsLink[] = [
  { href: '/dashboard/founder/settings', label: 'Settings', icon: Settings },
];

const linksByRole: Record<string, SettingsLink[]> = {
  student: studentLinks,
  company: companyLinks,
  mentor: mentorLinks,
  founder: founderLinks,
  admin: [],
};

export function SettingsSidebar({ role }: SettingsSidebarProps) {
  const pathname = usePathname();
  const links = linksByRole[role] || [];

  return (
    <nav className="w-full md:w-56 space-y-1 flex-shrink-0">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              active
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-charcoal-600 hover:bg-charcoal-100 dark:text-charcoal-400 dark:hover:bg-charcoal-800'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}