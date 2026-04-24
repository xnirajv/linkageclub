'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentGrid } from '@/components/assessments/AssessmentGrid';
import { AssessmentFilters } from '@/components/assessments/AssessmentFilters';
import { BadgeDisplay } from '@/components/assessments/BadgeDisplay';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAssessments } from '@/hooks/useAssessments';
import { useProfile } from '@/hooks/useProfile';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Available tab - exclude completed
  const {
    assessments = [],
    pagination,
    isLoading: isLoadingAvailable,
    applyFilters,
    loadMore,
    mutate: mutateAvailable,
  } = useAssessments({
    search: debouncedSearch,
    excludeCompleted: true, // Always exclude for Available
  });

  // ✅ Completed tab - include all (separate instance to avoid cache conflict)
  const {
    assessments: allAssessments = [],
    isLoading: isLoadingAll,
    mutate: mutateAll,
  } = useAssessments({
    excludeCompleted: false, // Show all
    limit: 50, // Get more for filtering
  });

  const { badges = [], isLoading: profileLoading } = useProfile();

  // ✅ Filter completed - only those with completedAt
  const completedAssessments = useMemo(() => {
    return allAssessments.filter((a: any) => {
      // Check if user has any completed attempt
      const hasCompletedAttempt = a.attempts?.some(
        (att: any) => att.completedAt
      );
      return hasCompletedAttempt || a.userAttempt?.completedAt;
    });
  }, [allAssessments]);

  // Filter in-progress - started but not completed
  const inProgressAssessments = useMemo(() => {
    return allAssessments.filter((a: any) => {
      const hasIncompleteAttempt = a.attempts?.some(
        (att: any) => !att.completedAt
      );
      // Exclude if already in completed
      const isCompleted = completedAssessments.some((c: any) => c._id === a._id);
      return hasIncompleteAttempt && !isCompleted;
    });
  }, [allAssessments, completedAssessments]);

  // ✅ Refresh all data when tab changes or page becomes visible
  const refreshAll = useCallback(() => {
    mutateAvailable();
    mutateAll();
  }, [mutateAvailable, mutateAll]);

  // Refresh on tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setTimeout(refreshAll, 100);
  }, [refreshAll]);

  // Refresh on mount
  useEffect(() => {
    refreshAll();
  }, []);

  // Refresh when page becomes visible (user returns from taking assessment)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    };

    const handleFocus = () => {
      refreshAll();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshAll]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    applyFilters(newFilters);
  };

  const handleQuickStart = (id: string) => {
    router.push(`/dashboard/student/assessments/${id}`);
  };

  const isLoadingAny = isLoadingAvailable || isLoadingAll || profileLoading;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
          Skill Assessments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get verified and earn badges to boost your profile
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">
            Available
            {assessments.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({assessments.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress
            {inProgressAssessments.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({inProgressAssessments.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedAssessments.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({completedAssessments.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="badges">
            My Badges
            {badges.length > 0 && (
              <span className="ml-1 text-xs opacity-60">({badges.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Available */}
        <TabsContent value="available" className="space-y-6 mt-6">
          <div className="space-y-4">
            <SearchInput
              placeholder="Search assessments by skill or title..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onClear={() => handleSearch('')}
            />
            <AssessmentFilters onFilterChange={handleFilterChange} />
            <AssessmentGrid
              assessments={assessments}
              isLoading={isLoadingAny}
              emptyMessage="All assessments completed! 🎉"
              onQuickStart={handleQuickStart}
            />
            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={loadMore} disabled={isLoadingAny}>
                  Load More Assessments
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* In Progress */}
        <TabsContent value="in-progress" className="mt-6">
          <AssessmentGrid
            assessments={inProgressAssessments as any}
            isLoading={isLoadingAny}
            emptyMessage="No assessments in progress"
            onQuickStart={handleQuickStart}
          />
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="mt-6">
          <AssessmentGrid
            assessments={completedAssessments as any}
            isLoading={isLoadingAny}
            emptyMessage="No completed assessments yet. Start your first assessment!"
            onQuickStart={handleQuickStart}
          />
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="mt-6">
          <BadgeDisplay badges={badges} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
