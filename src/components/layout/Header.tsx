'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Bell, CreditCard, Loader2, LogOut, Menu, Search, Settings, User, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

const titleMap: Record<string, string> = {
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
  search: 'Workspace Search',
  startup: 'Startup',
  'team-building': 'Team Building',
  'talent-search': 'Talent Search',
};

export function Header({ onMenuClick, className }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('q') || '');
  const role = session?.user?.role || 'student';
  const searchPlaceholder =
    role === 'company'
      ? 'Search projects, candidates, applications...'
      : 'Search your workspace';

  React.useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'dashboard';
  const pageTitle = titleMap[lastSegment] || lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      router.push('/dashboard/search');
      return;
    }

    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  };

  const handleNotificationSelect = async (notificationId: string, link?: string, read?: boolean) => {
    if (!read) {
      await markAsRead(notificationId);
    }

    if (link) {
      router.push(link);
    }
  };

  return (
    <header
      className={cn(
        'glass-card sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between rounded-[28px] px-4 py-3 lg:mx-0 lg:mr-3',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-charcoal-400 dark:text-charcoal-400">Workspace</p>
          <h1 className="text-lg font-semibold text-charcoal-900 md:text-2xl dark:text-white">{pageTitle}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-72 rounded-full pl-10"
          />
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] rounded-full bg-secondary-500 px-1 text-[10px] font-semibold text-charcoal-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-3xl">
            <DropdownMenuLabel className="flex items-center justify-between gap-3 text-charcoal-900 dark:text-white">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={() => void markAllAsRead()}
                >
                  Mark all read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificationsLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-charcoal-500 dark:text-charcoal-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading updates
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-charcoal-500 dark:text-charcoal-400">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className="cursor-pointer rounded-2xl p-3"
                  onSelect={(event) => {
                    event.preventDefault();
                    void handleNotificationSelect(notification._id, notification.link, notification.read);
                  }}
                >
                  <div className="flex gap-3">
                    <div className={cn('mt-1 h-2.5 w-2.5 rounded-full', notification.read ? 'bg-charcoal-200' : 'bg-info-600')} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-charcoal-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-charcoal-500 dark:text-charcoal-400">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${['dashboard'].join('/')}/${role}`}>
                Open dashboard
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 rounded-full px-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={session?.user?.image || ''} />
                <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-3xl">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-charcoal-900 dark:text-white">{session?.user?.name}</span>
                <span className="text-xs text-charcoal-500 dark:text-charcoal-400">{session?.user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/${role}/profile`}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            {role === 'company' && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/company/team">
                  <Users className="mr-2 h-4 w-4" />
                  Team Management
                </Link>
              </DropdownMenuItem>
            )}
            {role === 'company' && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/company/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Invoices
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/${role}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-charcoal-700 dark:text-charcoal-200" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
