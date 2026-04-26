'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentGrid } from '@/components/assessments/AssessmentGrid';
import { AssessmentFilters } from '@/components/assessments/AssessmentFilters';
import { BadgeDisplay } from '@/components/assessments/BadgeDisplay';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useAssessments } from '@/hooks/useAssessments';
import { useProfile } from '@/hooks/useProfile';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // User profile for skills
  const { profile } = useProfile();

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
    excludeCompleted: true,
  });

  // All assessments for other tabs
  const {
    assessments: allAssessments = [],
    isLoading: isLoadingAll,
    mutate: mutateAll,
  } = useAssessments({
    excludeCompleted: false,
    limit: 50,
  });

  const { badges = [], isLoading: profileLoading } = useProfile();

  // ✅ Get user's verified skills
  const userSkills = useMemo(() => {
    return profile?.skills?.filter((s: any) => s.verified).map((s: any) => s.name) || [];
  }, [profile]);

  // ✅ Recommended assessments - match user skills ya popular
  const recommendedAssessments = useMemo(() => {
    if (userSkills.length === 0) {
      // No skills - show popular (high pass rate, high attempts)
      return [...allAssessments]
        .filter((a: any) => !a.userAttempt?.completedAt)
        .sort((a: any, b: any) => (b.totalAttempts || 0) - (a.totalAttempts || 0))
        .slice(0, 3);
    }

    // Match with user skills
    const matched = allAssessments.filter((a: any) => 
      userSkills.some((skill: string) => 
        a.skillName?.toLowerCase().includes(skill.toLowerCase()) ||
        a.tags?.some((tag: string) => tag.toLowerCase().includes(skill.toLowerCase()))
      )
    );

    const unmatched = allAssessments.filter((a: any) => 
      !matched.find((m: any) => m._id === a._id)
    );

    // Matched first, then popular
    return [
      ...matched.filter((a: any) => !a.userAttempt?.completedAt),
      ...unmatched
        .filter((a: any) => !a.userAttempt?.completedAt)
        .sort((a: any, b: any) => (b.totalAttempts || 0) - (a.totalAttempts || 0)),
    ].slice(0, 4);
  }, [allAssessments, userSkills]);

  // Other assessments (not recommended)
  const otherAssessments = useMemo(() => {
    const recommendedIds = new Set(recommendedAssessments.map((a: any) => a._id));
    return assessments.filter((a: any) => !recommendedIds.has(a._id));
  }, [assessments, recommendedAssessments]);

  // Completed
  const completedAssessments = useMemo(() => {
    return allAssessments.filter((a: any) => a.userAttempt?.completedAt);
  }, [allAssessments]);

  // In Progress
  const inProgressAssessments = useMemo(() => {
    return allAssessments.filter((a: any) => {
      const hasIncomplete = a.attempts?.some((att: any) => !att.completedAt);
      return hasIncomplete && !a.userAttempt?.completedAt;
    });
  }, [allAssessments]);

  // Refresh on mount & tab change
  const refreshAll = useCallback(() => {
    mutateAvailable();
    mutateAll();
  }, [mutateAvailable, mutateAll]);

  useEffect(() => { refreshAll(); }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setTimeout(refreshAll, 100);
  }, [refreshAll]);

  // Refresh on page visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAll();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', refreshAll);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', refreshAll);
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

      {/* ✅ SINGLE Search Box - always visible */}
      <SearchInput
        placeholder="Search assessments by skill or title..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onClear={() => handleSearch('')}
      />

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

        {/* Available Tab */}
        <TabsContent value="available" className="space-y-6 mt-6">
          {/* ✅ Recommended Section */}
          {recommendedAssessments.length > 0 && searchQuery === '' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">
                  {userSkills.length > 0 ? 'Recommended for You' : 'Popular Assessments'}
                </h2>
                {userSkills.length > 0 && (
                  <div className="flex gap-1">
                    {userSkills.slice(0, 3).map((skill: string) => (
                      <Badge key={skill} variant="skill" size="sm">{skill}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <AssessmentGrid
                assessments={recommendedAssessments}
                isLoading={isLoadingAny}
                emptyMessage=""
                onQuickStart={handleQuickStart}
              />
            </div>
          )}

          {/* ✅ All Other Assessments */}
          <div className="space-y-4">
            {recommendedAssessments.length > 0 && otherAssessments.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold">All Assessments</h2>
              </div>
            )}
            
            {/* Filters - only show when not searching */}
            {searchQuery === '' && (
              <AssessmentFilters onFilterChange={handleFilterChange} />
            )}

            <AssessmentGrid
              assessments={searchQuery ? assessments : otherAssessments}
              isLoading={isLoadingAny}
              emptyMessage="No assessments found"
              onQuickStart={handleQuickStart}
            />

            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" onClick={loadMore} disabled={isLoadingAny}>
                  Load More
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
            emptyMessage="No completed assessments yet"
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