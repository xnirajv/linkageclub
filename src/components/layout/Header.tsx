'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils/cn';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  const { resolvedTheme, toggleTheme, mounted } = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const role = profile?.role || 'company';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={cn(
      'sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl',
      className
    )}>
      {/* Top Row */}
      <div className="flex items-center justify-between h-14 px-4 md:px-6 gap-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, candidates, applications...     ⌘K"
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          )}

          {/* Notifications */}
          <Link
            href={`/dashboard/${role}/notifications`}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#0a0a0a]" />
            )}
          </Link>

          {/* Profile Avatar */}
          <Link
            href={`/dashboard/${role}/profile`}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 dark:from-white dark:to-gray-200 flex items-center justify-center text-white dark:text-gray-900 text-xs font-bold ml-1 hover:scale-105 transition-transform"
          >
            {(profile?.name || 'C').charAt(0).toUpperCase()}
          </Link>
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs />
    </header>
  );
}