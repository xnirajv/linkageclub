'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { cn } from '@/lib/utils/cn';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
      </div>
    );
  }

  if (!user) return null;

  const role = user.role || 'student';

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className={cn(
        'transition-all duration-200',
        collapsed ? 'ml-[72px]' : 'ml-[260px]'
      )}>
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}