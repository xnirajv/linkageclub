'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, BookOpen, Briefcase, Calendar, Shield, Star, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAssessments } from '@/hooks/useAssessments';
import { useMentors } from '@/hooks/useMentors';
import { useNotifications } from '@/hooks/useNotifications';
import { useProfile } from '@/hooks/useProfile';
import { useProjects } from '@/hooks/useProjects';
import { RecentActivity } from '@/components/dashboard/common/RecentActivity';
import { DashboardHero, DashboardMetricGrid, DashboardSection } from '@/components/dashboard/common/PremiumDashboard';
import { TrustScore } from '@/components/dashboard/common/TrustScore';
import { ActiveProjects } from '@/components/dashboard/student/ActiveProjects';
import { RecommendedProjects } from '@/components/dashboard/student/RecommendedProjects';
import { SkillProgress } from '@/components/dashboard/student/SkillProgress';
import { UpcomingDeadlines } from '@/components/dashboard/student/UpcomingDeadlines';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Notification as NotificationType } from '@/types/notification';
import type { Skill } from '@/types/user';
// ✅ REMOVE useSession import - no longer needed
// import { useSession } from 'next-auth/react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { profile, skills, badges, isLoading: profileLoading } = useProfile();
  const { projects = [], isLoading: projectsLoading } = useProjects({ limit: 5 });
  const { assessments = [], isLoading: assessmentsLoading } = useAssessments({ limit: 3 });
  useMentors({ limit: 3 });
  const { notifications = [], isLoading: notificationsLoading } = useNotifications();

  const verifiedSkills = skills.filter((skill: Skill) => skill.verified).length;
  const trustScore = profile?.trustScore || authUser?.trustScore || 0;
  const unreadCount = notifications.filter((item: NotificationType) => !item.read).length;
  
  // ✅ Get name from profile instead of session
  const displayName = profile?.name?.split(' ')[0] || authUser?.name?.split(' ')[0] || 'Student';
  
  const metrics = useMemo(
    () => [
      {
        label: 'Projects applied',
        value: projects.length,
        icon: Briefcase,
        accent: 'primary' as const,
        meta: '+2 this week',
        href: '/dashboard/student/projects',
      },
      {
        label: 'Skills verified',
        value: verifiedSkills,
        icon: Award,
        accent: 'secondary' as const,
        meta: `${badges.length} badges earned`,
        href: '/dashboard/student/assessments',
      },
      {
        label: 'Trust score',
        value: trustScore,
        icon: Shield,
        accent: 'info' as const,
        meta: 'Higher scores unlock stronger matches',
        href: '/dashboard/student/trust-score',
      },
      {
        label: 'Unread updates',
        value: unreadCount,
        icon: Users,
        accent: 'charcoal' as const,
        meta: 'Messages, reviews, and project updates',
      },
    ],
    [projects.length, verifiedSkills, badges.length, trustScore, unreadCount]
  );

  const activities = useMemo(
    () =>
      [
        ...projects.slice(0, 2).map((project: any) => ({
          id: `project-${project._id}`,
          action: `Applied to ${project.title}`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          link: `/dashboard/student/projects/${project._id}`,
        })),
        ...assessments.slice(0, 2).map((assessment: any) => ({
          id: `assessment-${assessment._id}`,
          action: `Completed ${assessment.title}`,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          link: `/dashboard/student/assessments/${assessment._id}`,
        })),
        ...notifications.slice(0, 2).map((notification: NotificationType) => ({
          id: `notification-${notification._id}`,
          action: notification.title,
          timestamp: new Date(notification.createdAt),
          link: notification.link,
        })),
      ].slice(0, 5),
    [projects, assessments, notifications]
  );

  if (profileLoading || projectsLoading || assessmentsLoading || notificationsLoading) {
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
        eyebrow="Student workspace"
        title={`Welcome back, ${displayName}`}
        description="Track applications, strengthen your trust score, and move from learning into real opportunities with a calmer, premium workflow."
        actions={[
          { label: 'Browse projects', href: '/dashboard/student/projects', variant: 'default' },
          { label: 'Take assessment', href: '/dashboard/student/assessments' },
        ]}
        stats={[
          { label: 'Trust score', value: `${trustScore}` },
          { label: 'Verified skills', value: `${verifiedSkills}` },
          { label: 'Unread', value: `${unreadCount}` },
        ]}
      />

      <DashboardMetricGrid metrics={metrics} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <TrustScore
            score={trustScore}
            trend={5}
            factors={[
              {
                label: 'Projects Completed',
                value: profile?.stats?.projectsCompleted ? Math.min((profile.stats.projectsCompleted / 10) * 100, 100) : 0,
                description: 'Based on successful project deliveries',
              },
              {
                label: 'Skills Verified',
                value: verifiedSkills * 10,
                description: 'Verified through assessments',
              },
              {
                label: 'Positive Reviews',
                value: profile?.stats?.averageRating ? (profile.stats.averageRating / 5) * 100 : 0,
                description: 'Client and mentor feedback quality',
              },
            ]}
            onImproveClick={() => router.push('/dashboard/student/trust-score')}
          />

          <DashboardSection
            title="Recommended projects"
            subtitle="Curated opportunities based on your current profile and verified skills."
            action={{ label: 'View all', href: '/dashboard/student/projects' }}
          >
            <RecommendedProjects
              projects={projects as any}
              isLoading={projectsLoading}
              onDismiss={(id) => console.log('Dismissed project:', id)}
            />
          </DashboardSection>

          <DashboardSection
            title="Active work"
            subtitle="Stay on top of projects already in motion."
            action={{ label: 'Open projects', href: '/dashboard/student/projects' }}
          >
            <ActiveProjects
              projects={projects.filter((project: any) => project.status === 'active') as any}
              emptyMessage="No active projects yet. Browse opportunities to get started."
            />
          </DashboardSection>
        </div>

        <div className="space-y-6">
          <DashboardSection title="Upcoming deadlines" subtitle="Keep your workload calm and predictable.">
            <UpcomingDeadlines />
          </DashboardSection>

          <DashboardSection title="Recent activity" subtitle="Your latest movement across applications, assessments, and updates.">
            <RecentActivity activities={activities} title="Latest updates" viewAllLink="/dashboard/student/activity" />
          </DashboardSection>

          <DashboardSection title="Skill momentum" subtitle="See what is already strong and what to verify next.">
            <SkillProgress
              skills={skills}
              onVerify={(skillName) => router.push(`/dashboard/student/assessments?skill=${skillName}`)}
            />
          </DashboardSection>

          <Card className="overflow-hidden border-none bg-gradient-to-br from-secondary-400 via-secondary-500 to-info-600 text-charcoal-950">
            <CardContent className="p-6">
              <div className="inline-flex rounded-full bg-card/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                Next best step
              </div>
              <h3 className="mt-4 text-2xl font-semibold">Boost your profile with verified proof.</h3>
              <p className="mt-3 text-sm leading-7 text-charcoal-900/80">
                Complete another assessment or update your profile so companies see stronger evidence when they shortlist candidates.
              </p>
              <Button asChild className="mt-5 bg-card text-charcoal-950 hover:bg-card/90">
                <Link href="/dashboard/student/profile">
                  Complete profile
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
