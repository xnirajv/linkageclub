'use client';

import React, { useState, useMemo } from 'react';
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

  // ✅ Available tab: exclude completed assessments
  const {
    assessments = [],
    pagination,
    isLoading,
    applyFilters,
    loadMore,
  } = useAssessments({
    search: debouncedSearch,
    excludeCompleted: activeTab === 'available', // ✅ Exclude when Available tab
  });

  const { badges = [], isLoading: profileLoading } = useProfile();

  // Get completed assessments for Completed tab
  const { assessments: allAssessments = [] } = useAssessments({
    excludeCompleted: false,
  });

  // Filter completed
  const completedAssessments = useMemo(() => {
    return allAssessments.filter(
      (a: any) => a.userAttempt?.completedAt
    );
  }, [allAssessments]);

  // Filter in-progress (started but not completed)
  const inProgressAssessments = useMemo(() => {
    return allAssessments.filter(
      (a: any) =>
        a.attempts?.some(
          (att: any) =>
            att.userId && !att.completedAt
        )
    );
  }, [allAssessments]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    applyFilters(newFilters);
  };

  const handleQuickStart = (id: string) => {
    router.push(`/dashboard/student/assessments/${id}`);
  };

  const isLoadingAny = isLoading || profileLoading;

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="badges">My Badges</TabsTrigger>
        </TabsList>

        {/* Available - excludes completed */}
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
              emptyMessage="No assessments available. You've completed all!"
              onQuickStart={handleQuickStart}
            />

            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingAny}
                >
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
            emptyMessage="No completed assessments yet. Start one!"
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