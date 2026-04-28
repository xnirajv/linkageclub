'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={cn('sticky top-0 z-30 h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-between px-6', className)}>
      <form onSubmit={handleSearch} className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-64 h-9 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all"
        />
      </form>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href={`/dashboard/${profile?.role || 'student'}/notifications`}
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#0a0a0a]" />
          )}
        </Link>

        <Link
          href={`/dashboard/${profile?.role || 'student'}/profile`}
          className="w-7 h-7 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-[10px] font-medium"
        >
          {(profile?.name || 'U').charAt(0).toUpperCase()}
        </Link>
      </div>
    </header>
  );
}