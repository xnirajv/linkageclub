'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Heart, Rocket, TrendingUp, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHero, DashboardMetricGrid, DashboardSection } from '@/components/dashboard/common/PremiumDashboard';
import { QuickActions } from '@/components/dashboard/common/QuickActions';
import { RecentActivity } from '@/components/dashboard/common/RecentActivity';
import { CoFounderMatch } from '@/components/dashboard/founder/CoFounderMatch';
import { InvestorUpdates } from '@/components/dashboard/founder/InvestorUpdates';
import { StartupProfile } from '@/components/dashboard/founder/StartupProfile';
import { TeamMembers } from '@/components/dashboard/founder/TeamMembers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  trustScore?: number;
  startupName?: string;
}

export default function FounderDashboardPage() {
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };

  const stats = [
    { label: 'Team members', value: 4, icon: Users, accent: 'primary' as const, meta: 'Core startup team' },
    { label: 'Co-founder matches', value: 3, icon: UserPlus, accent: 'secondary' as const, meta: 'High-fit candidates' },
    { label: 'Investor interest', value: 2, icon: TrendingUp, accent: 'info' as const, meta: 'Recent inbound signals' },
    { label: 'Profile views', value: 156, icon: Activity, accent: 'charcoal' as const, meta: '+23% this month' },
  ];

  const activities = [
    {
      id: '1',
      user: { name: 'Rohan Mehta' },
      action: 'New co-founder match found with Rohan Mehta',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      user: { name: 'Sequoia Capital' },
      action: 'Investor viewed your profile',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      user: { name: 'Priya Sharma' },
      action: 'New team member joined as Tech Lead',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ];

  const quickActions = [
    {
      label: 'Find co-founder',
      icon: Heart,
      onClick: () => router.push('/dashboard/founder/cofounder-match'),
      description: 'Connect with aligned builders',
      variant: 'outline' as const,
    },
    {
      label: 'Build team',
      icon: Users,
      onClick: () => router.push('/dashboard/founder/team-building'),
      description: 'Hire your early operators',
      variant: 'outline' as const,
    },
    {
      label: 'Investor pipeline',
      icon: TrendingUp,
      onClick: () => router.push('/dashboard/founder/investors'),
      description: 'Track traction and investor conversations',
      variant: 'outline' as const,
    },
  ];

  const profileCompletion = user?.startupName ? 80 : 60;

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Founder workspace"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Founder'}`}
        description="Present your startup with more credibility, find aligned co-founders, and keep investor and team-building momentum moving in one premium workspace."
        actions={[
          { label: 'Update startup profile', href: '/dashboard/founder/startup/edit', variant: 'default' },
          { label: 'Explore matches', href: '/dashboard/founder/cofounder-match' },
        ]}
        stats={[
          { label: 'Team', value: '4' },
          { label: 'Matches', value: '3' },
          { label: 'Investor signals', value: '2' },
        ]}
        accent="charcoal"
      />

      <DashboardMetricGrid metrics={stats} />

      <Card className="luxury-border">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-900 dark:text-white">Startup profile completion</p>
              <p className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">Complete your profile to improve co-founder and investor response quality.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2.5 w-40 overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                <div className="h-full rounded-full bg-gradient-to-r from-primary-700 to-info-600" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-sm font-semibold text-primary-700 dark:text-info-300">{profileCompletion}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <DashboardSection title="Startup profile" subtitle="Your current startup presentation and positioning.">
            <StartupProfile />
          </DashboardSection>

          <DashboardSection
            title="Co-founder matches"
            subtitle="High-fit collaborators surfaced for your current startup profile."
            action={{ label: 'View all', href: '/dashboard/founder/cofounder-match' }}
          >
            <CoFounderMatch />
          </DashboardSection>
        </div>

        <div className="space-y-6">
          <DashboardSection title="Quick actions" subtitle="The fastest ways to move the startup forward this week.">
            <QuickActions actions={quickActions} title="Founder actions" />
          </DashboardSection>

          <DashboardSection title="Team members" subtitle="Current builders around your startup.">
            <TeamMembers />
          </DashboardSection>

          <DashboardSection title="Investor updates" subtitle="Recent traction and funding-side movement.">
            <InvestorUpdates />
          </DashboardSection>

          <DashboardSection title="Recent activity" subtitle="Signals across talent, investors, and startup visibility.">
            <RecentActivity activities={activities} title="Recent activity" />
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/dashboard/founder/startup/edit">
                <Rocket className="mr-2 h-4 w-4" />
                Refine startup profile
              </Link>
            </Button>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
