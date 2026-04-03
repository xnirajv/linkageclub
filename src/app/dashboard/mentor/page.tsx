'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, Calendar, Clock, DollarSign, MessageCircle, Star, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMentor } from '@/hooks/useMentors';
import { DashboardHero, DashboardMetricGrid, DashboardSection } from '@/components/dashboard/common/PremiumDashboard';
import { RecentActivity } from '@/components/dashboard/common/RecentActivity';
import { QuickActions } from '@/components/dashboard/common/QuickActions';
import { AvailabilityCalendar } from '@/components/dashboard/mentor/AvailabilityCalendar';
import { EarningsOverview } from '@/components/dashboard/mentor/EarningsOverview';
import { StudentList } from '@/components/dashboard/mentor/StudentList';
import { UpcomingSessions } from '@/components/dashboard/mentor/UpcomingSessions';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface Student {
  _id: string;
  name: string;
  avatar?: string;
  totalSessions: number;
  completedSessions: number;
  averageRating: number;
  lastSession: Date | number;
  isActive: boolean;
}

interface Session {
  _id: string;
  studentId: string;
  student?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  date: string | Date;
  status: string;
  amount: number;
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };
  const { mentor, isLoading } = useMentor(user?.id || '');

  const students: Student[] = !mentor?.sessions
    ? []
    : mentor.sessions.reduce((acc: Student[], session: Session) => {
        const existing = acc.find((item) => item._id === session.studentId);
        if (existing) {
          existing.totalSessions += 1;
          if (session.status === 'completed') existing.completedSessions += 1;
          existing.lastSession = Math.max(existing.lastSession as number, new Date(session.date).getTime());
          return acc;
        }

        acc.push({
          _id: session.studentId,
          name: session.student?.name || 'Student',
          avatar: session.student?.avatar,
          totalSessions: 1,
          completedSessions: session.status === 'completed' ? 1 : 0,
          averageRating: 0,
          lastSession: new Date(session.date).getTime(),
          isActive: new Date(session.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        });
        return acc;
      }, []);

  const recentStudents = [...students]
    .sort((a, b) => (b.lastSession as number) - (a.lastSession as number))
    .slice(0, 3);

  const metrics = [
    {
      label: 'Total sessions',
      value: mentor?.stats?.totalSessions || 0,
      icon: Calendar,
      accent: 'primary' as const,
      meta: `${mentor?.stats?.completedSessions || 0} completed`,
      href: '/dashboard/mentor/sessions',
    },
    {
      label: 'Total earnings',
      value: `₹${(mentor?.stats?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      accent: 'secondary' as const,
      meta: 'Across all completed sessions',
      href: '/dashboard/mentor/earnings',
    },
    {
      label: 'Average rating',
      value: mentor?.stats?.averageRating?.toFixed(1) || '0.0',
      icon: Star,
      accent: 'info' as const,
      meta: `${mentor?.stats?.totalReviews || 0} reviews`,
    },
    {
      label: 'Repeat students',
      value: mentor?.stats?.repeatStudents || 0,
      icon: Users,
      accent: 'charcoal' as const,
      meta: 'Returning learners who booked again',
      href: '/dashboard/mentor/students',
    },
  ];

  const activities = [
    {
      id: '1',
      action: 'Completed session with Riya Sharma',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: { name: 'Riya Sharma' },
    },
    {
      id: '2',
      action: 'Received a 5-star review',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      action: 'New session booked by Amit Kumar',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      user: { name: 'Amit Kumar' },
    },
  ];

  const quickActions = [
    {
      label: 'Set availability',
      icon: Calendar,
      onClick: () => router.push('/dashboard/mentor/availability'),
      description: 'Manage your schedule',
      variant: 'outline' as const,
    },
    {
      label: 'View sessions',
      icon: Clock,
      onClick: () => router.push('/dashboard/mentor/sessions'),
      description: 'Upcoming and past bookings',
      variant: 'outline' as const,
    },
    {
      label: 'Track earnings',
      icon: DollarSign,
      onClick: () => router.push('/dashboard/mentor/earnings'),
      description: 'Review payout momentum',
      variant: 'outline' as const,
    },
    {
      label: 'My students',
      icon: Users,
      onClick: () => router.push('/dashboard/mentor/students'),
      description: 'See your learner relationships',
      variant: 'outline' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="h-52 animate-pulse rounded-[32px] bg-card/65 dark:bg-charcoal-900/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[28px] bg-card/65 dark:bg-charcoal-900/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHero
        eyebrow="Mentor workspace"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Mentor'}`}
        description="Run a premium mentorship practice with a calmer overview of sessions, earnings, ratings, and student momentum."
        actions={[
          { label: 'Set availability', href: '/dashboard/mentor/availability', variant: 'default' },
          { label: 'View earnings', href: '/dashboard/mentor/earnings' },
        ]}
        stats={[
          { label: 'Sessions', value: `${mentor?.stats?.totalSessions || 0}` },
          { label: 'Rating', value: mentor?.stats?.averageRating?.toFixed(1) || '0.0' },
          { label: 'Students', value: `${students.length}` },
        ]}
        accent="info"
      />

      <DashboardMetricGrid metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <DashboardSection
            title="Upcoming sessions"
            subtitle="Your next sessions, framed for quick decision-making."
            action={{ label: 'All sessions', href: '/dashboard/mentor/sessions' }}
          >
            <UpcomingSessions limit={3} showViewAll />
          </DashboardSection>

          <DashboardSection
            title="Earnings overview"
            subtitle="A premium snapshot of how your mentoring work is compounding."
            action={{ label: 'Open earnings', href: '/dashboard/mentor/earnings' }}
          >
            <EarningsOverview showViewAll />
          </DashboardSection>
        </div>

        <div className="space-y-6">
          <DashboardSection title="Quick actions" subtitle="The actions that keep your mentor workflow moving.">
            <QuickActions actions={quickActions} title="Mentor actions" />
          </DashboardSection>

          <DashboardSection title="Availability" subtitle="Keep your schedule visible and easy to manage.">
            <AvailabilityCalendar />
          </DashboardSection>

          <DashboardSection
            title="Recent students"
            subtitle="Learners with the freshest activity."
            action={{ label: 'View all', href: '/dashboard/mentor/students' }}
          >
            <StudentList students={recentStudents} />
          </DashboardSection>

          <DashboardSection title="Recent activity" subtitle="The latest movement across your mentoring practice.">
            <RecentActivity activities={activities} title="Recent activity" />
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/messages">
                <MessageCircle className="mr-2 h-4 w-4" />
                View messages
              </Link>
            </Button>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
