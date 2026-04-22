'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';
import { AssessmentGrid } from '@/components/assessments/AssessmentGrid';
import { AssessmentFilters } from '@/components/assessments/AssessmentFilters';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAssessments } from '@/hooks/useAssessments';
import { useDebounce } from '@/hooks/useDebounce';
import { BadgeDisplay } from '@/components/dashboard/student/BadgeDisplay';
import { useProfile } from '@/hooks/useProfile';
import { Assessment, UserAssessment } from '@/types/assessment';

export default function StudentAssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get all available assessments (active)
  const {
    assessments = [],
    pagination,
    isLoading,
    applyFilters
  } = useAssessments({
    search: debouncedSearch,
    ...filters,
  });

  // Get user's profile with badges
  const { badges = [], isLoading: profileLoading } = useProfile();

  // ✅ Get user's attempted assessments (both in-progress and completed)
  const { data: userAssessmentsData } = useSWR<{ assessments: any[] }>('/api/assessments/user', fetcher);
  const allUserAssessments = userAssessmentsData?.assessments || [];

  // ✅ Set of attempted assessment IDs (to filter out from Available tab)
  const attemptedIds = useMemo(() => {
    return new Set(allUserAssessments.map((a: any) => a.id));
  }, [allUserAssessments]);

  // ✅ Available assessments = all active assessments - attempted ones
  const availableAssessments = useMemo(() => {
    return assessments.filter((a: any) => !attemptedIds.has(a._id));
  }, [assessments, attemptedIds]);

  // Format user assessments for display
  const formattedUserAssessments = useMemo(() => {
    return allUserAssessments.map((assessment: any): UserAssessment => ({
      id: assessment.id,
      title: assessment.title,
      skillName: assessment.skillName,
      level: assessment.level,
      passingScore: assessment.passingScore,
      attempt: {
        score: assessment.attempt?.score || 0,
        passed: assessment.attempt?.passed || false,
        timeSpent: assessment.attempt?.timeSpent || 0,
        startedAt: assessment.attempt?.startedAt || new Date(),
        completedAt: assessment.attempt?.completedAt || null,
      },
      badgeEarned: assessment.badgeEarned || false,
    }));
  }, [allUserAssessments]);

  // Filter in-progress assessments (started but not completed)
  const inProgressAssessments = useMemo(() => {
    return formattedUserAssessments.filter(
      (ua: UserAssessment) => !ua.attempt.completedAt
    );
  }, [formattedUserAssessments]);

  // Filter completed assessments
  const completedAssessments = useMemo(() => {
    return formattedUserAssessments.filter(
      (ua: UserAssessment) => ua.attempt.completedAt
    );
  }, [formattedUserAssessments]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleLoadMore = () => {
    if (pagination?.page < pagination?.pages) {
      applyFilters({ page: (pagination.page || 1) + 1 });
    }
  };

  const isLoadingAny = isLoading || profileLoading;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
          Skill Assessments
        </h1>
        <p className="text-charcoal-600 dark:text-charcoal-400">
          Get verified and earn badges to boost your profile
        </p>
      </div>

      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="badges">My Badges</TabsTrigger>
        </TabsList>

        {/* Available Assessments Tab - Only shows assessments user hasn't attempted */}
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
              assessments={availableAssessments}
              isLoading={isLoadingAny}
              emptyMessage="No assessments found"
            />

            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingAny}
                >
                  Load More Assessments
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* In Progress Assessments Tab - Shows incomplete assessments */}
        <TabsContent value="in-progress" className="mt-6">
          <AssessmentGrid
            assessments={inProgressAssessments as any}
            isLoading={isLoadingAny}
            emptyMessage="No assessments in progress"
          />
        </TabsContent>

        {/* Completed Assessments Tab - Shows completed assessments */}
        <TabsContent value="completed" className="mt-6">
          <AssessmentGrid
            assessments={completedAssessments as any}
            isLoading={isLoadingAny}
            emptyMessage="No completed assessments"
          />
        </TabsContent>

        {/* Badges Tab - Shows earned badges */}
        <TabsContent value="badges" className="mt-6">
          <BadgeDisplay badges={badges} />
        </TabsContent>
      </Tabs>
    </div>
  );
}