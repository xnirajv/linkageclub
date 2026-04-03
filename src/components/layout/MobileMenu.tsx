'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  BarChart3,
  Bell,
  Briefcase,
  Building,
  CreditCard,
  HelpCircle,
  Home,
  LogOut,
  PenSquare,
  Settings,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { cn } from '@/lib/utils/cn';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const getRoleMenuItems = (role: string) => {
  if (role === 'company') {
    return [
      { title: 'Dashboard Home', href: '/dashboard/company', icon: Home },
      { title: 'Post New Project', href: '/dashboard/company/post-project', icon: PenSquare },
      { title: 'My Projects', href: '/dashboard/company/my-projects', icon: Briefcase },
      { title: 'Applications', href: '/dashboard/company/applications', icon: UserPlus },
      { title: 'Jobs', href: '/dashboard/company/jobs', icon: Briefcase },
      { title: 'Talent Search', href: '/dashboard/company/talent-search', icon: Users },
      { title: 'Company Profile', href: '/dashboard/company/profile', icon: Building },
      { title: 'Analytics', href: '/dashboard/company/analytics', icon: BarChart3 },
      { title: 'Team', href: '/dashboard/company/team', icon: Users },
      { title: 'Billing', href: '/dashboard/company/billing', icon: CreditCard },
      { title: 'Notifications', href: '/dashboard/company/notifications', icon: Bell },
    ];
  }

  return [
    { title: 'Home', href: '/', icon: Home },
    { title: 'Companies', href: '/companies', icon: Briefcase },
    { title: 'Mentors', href: '/mentors', icon: Users },
    { title: 'Notifications', href: '/notifications', icon: Bell },
  ];
};

const getAccountItems = (role: string) => [
  { title: 'Settings', href: `/dashboard/${role}/settings`, icon: Settings },
  { title: 'Help', href: '/help', icon: HelpCircle },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const role = session?.user?.role || 'student';
  const menuItems = getRoleMenuItems(role);
  const accountItems = getAccountItems(role);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-charcoal-950/45 backdrop-blur-sm lg:hidden" />
      <div
        ref={menuRef}
        className="glass-card fixed inset-y-3 left-3 z-50 w-[calc(100%-1.5rem)] max-w-sm overflow-hidden rounded-[32px] lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/45 px-5 py-4 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal-400 dark:text-charcoal-400">Menu</p>
              <h2 className="text-lg font-semibold text-charcoal-900 dark:text-white">Workspace navigation</h2>
            </div>
            <Button variant="outline" size="icon-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-5 pt-4">
            <ThemeToggle className="w-full" />
          </div>

          {session ? (
            <div className="border-b border-white/45 px-5 py-5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={session.user?.image || ''} />
                  <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-charcoal-900 dark:text-white">{session.user?.name}</p>
                  <p className="truncate text-sm text-charcoal-500 dark:text-charcoal-400">{session.user?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge className="rounded-full bg-secondary-100 px-3 py-1 text-[10px] font-semibold capitalize text-secondary-900 dark:bg-secondary-900/25 dark:text-secondary-200">
                      {session.user?.role}
                    </Badge>
                    {role === 'company' && (
                      <Badge className="rounded-full bg-primary-100 px-3 py-1 text-[10px] font-semibold text-primary-800 dark:bg-primary-950/30 dark:text-info-300">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b border-white/45 p-5 dark:border-white/10">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-r from-primary-700 to-info-600 text-white'
                        : 'text-charcoal-700 hover:bg-card/80 hover:text-primary-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800/80 dark:hover:text-info-300'
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.title}
                  </Link>
                );
              })}
            </div>

            <div className="mt-7">
              <h4 className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-charcoal-400 dark:text-charcoal-400">
                Account
              </h4>
              <div className="space-y-1.5">
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  const href = item.href;
                  const isActive = pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r from-primary-700 to-info-600 text-white'
                          : 'text-charcoal-700 hover:bg-card/80 hover:text-primary-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800/80 dark:hover:text-info-300'
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {item.title}
                    </Link>
                  );
                })}

                {session && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-charcoal-700 transition hover:bg-card/80 hover:text-primary-700 dark:text-charcoal-200 dark:hover:bg-charcoal-800/80 dark:hover:text-info-300"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    Sign out
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
