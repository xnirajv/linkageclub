import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, BarChart3 } from 'lucide-react';

interface WelcomeBannerProps {
  firstName: string;
}

export function WelcomeBanner({ firstName }: WelcomeBannerProps) {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="mt-2 text-white/80 text-lg">
              Your company is making great progress!
            </p>
            <p className="text-white/70 text-sm">
              Here&apos;s what&apos;s happening with your projects and hiring.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-blue-700 hover:bg-blue-50 font-medium">
              <Link href="/dashboard/company/post-project">
                <Plus className="h-4 w-4 mr-2" />
                Post New Project
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-medium"
            >
              <Link href="/dashboard/company/talent-search">
                <Search className="h-4 w-4 mr-2" />
                Find Talent
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-medium"
            >
              <Link href="/dashboard/company/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}