'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-700" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell min-h-screen">
      <Sidebar role={user.role} />

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      <div className="transition-all duration-300 lg:pl-[308px]">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
        </div>

        <main className="premium-shell relative px-4 pb-8 sm:px-6 lg:px-8 lg:pb-10">
          <div className="absolute inset-0 premium-grid opacity-[0.24]" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
