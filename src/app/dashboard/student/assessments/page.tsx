'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentGrid } from '@/components/assessments/AssessmentGrid';
import { AssessmentFilters } from '@/components/assessments/AssessmentFilters';
import { BadgeDisplay } from '@/components/assessments/BadgeDisplay';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

  const { profile } = useProfile();

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

  const {
    assessments: allAssessments = [],
    isLoading: isLoadingAll,
    mutate: mutateAll,
  } = useAssessments({
    excludeCompleted: false,
    limit: 50,
  });

  const { badges = [], isLoading: profileLoading } = useProfile();

  // ✅ Get user's verified skills from profile
  const userSkills = useMemo(() => {
    if (!profile?.skills) return [];
    return profile.skills
      .filter((s: any) => s.verified)
      .map((s: any) => s.name?.toLowerCase().trim());
  }, [profile]);

  // ✅ Get user's interested skills (unverified bhi)
  const userAllSkills = useMemo(() => {
    if (!profile?.skills) return [];
    return profile.skills.map((s: any) => s.name?.toLowerCase().trim());
  }, [profile]);

  // ✅ Smart Recommendations based on user profile
  const recommendedAssessments = useMemo(() => {
    if (!allAssessments.length) return [];

    // Get assessments user hasn't completed
    const availableAssessments = allAssessments.filter(
      (a: any) => !a.userAttempt?.completedAt
    );

    if (userSkills.length === 0 && userAllSkills.length === 0) {
      // ✅ No skills = show popular assessments (high attempts + high pass rate)
      return availableAssessments
        .sort((a: any, b: any) => {
          const scoreA = (a.totalAttempts || 0) * 0.7 + (a.passRate || 0) * 0.3;
          const scoreB = (b.totalAttempts || 0) * 0.7 + (b.passRate || 0) * 0.3;
          return scoreB - scoreA;
        })
        .slice(0, 3);
    }

    // ✅ Match assessments with user's skills
    const scored = availableAssessments.map((assessment: any) => {
      const skillName = (assessment.skillName || '').toLowerCase();
      const tags = (assessment.tags || []).map((t: string) => t.toLowerCase());
      const title = (assessment.title || '').toLowerCase();
      const description = (assessment.description || '').toLowerCase();

      let matchScore = 0;

      // Check verified skills match (highest priority)
      userSkills.forEach((skill: string) => {
        if (skillName.includes(skill) || skill.includes(skillName)) {
          matchScore += 30;
        }
        tags.forEach((tag: string) => {
          if (tag.includes(skill) || skill.includes(tag)) {
            matchScore += 20;
          }
        });
        if (title.includes(skill)) matchScore += 10;
        if (description.includes(skill)) matchScore += 5;
      });

      // Check unverified skills
      const unverifiedSkills = userAllSkills.filter(
        (s) => !userSkills.includes(s)
      );
      unverifiedSkills.forEach((skill: string) => {
        if (skillName.includes(skill) || skill.includes(skillName)) {
          matchScore += 10;
        }
      });

      // Bonus for popular assessments
      matchScore += Math.min((assessment.totalAttempts || 0) / 10, 5);
      matchScore += Math.min((assessment.passRate || 0) / 10, 5);

      return { ...assessment, _matchScore: matchScore };
    });

    // Sort by match score, then filter only relevant ones
    const matched = scored
      .filter((a: any) => a._matchScore > 0)
      .sort((a: any, b: any) => b._matchScore - a._matchScore);

    // If no matches found, return top popular
    if (matched.length === 0) {
      return availableAssessments
        .sort(
          (a: any, b: any) =>
            (b.totalAttempts || 0) - (a.totalAttempts || 0)
        )
        .slice(0, 3);
    }

    return matched.slice(0, 3);
  }, [allAssessments, userSkills, userAllSkills]);

  // ✅ Other assessments = available minus recommended
  const otherAssessments = useMemo(() => {
    const recommendedIds = new Set(
      recommendedAssessments.map((a: any) => a._id)
    );
    return assessments.filter((a: any) => !recommendedIds.has(a._id));
  }, [assessments, recommendedAssessments]);

  // Completed
  const completedAssessments = useMemo(() => {
    return allAssessments.filter((a: any) => a.userAttempt?.completedAt);
  }, [allAssessments]);

  // In Progress
  const inProgressAssessments = useMemo(() => {
    return allAssessments.filter((a: any) => {
      const hasIncomplete = a.attempts?.some(
        (att: any) => !att.completedAt
      );
      return hasIncomplete && !a.userAttempt?.completedAt;
    });
  }, [allAssessments]);

  // Refresh handlers
  const refreshAll = useCallback(() => {
    mutateAvailable();
    mutateAll();
  }, [mutateAvailable, mutateAll]);

  useEffect(() => {
    refreshAll();
  }, []);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      setTimeout(refreshAll, 100);
    },
    [refreshAll]
  );

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
              <span className="ml-1 text-xs opacity-60">
                ({assessments.length})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
          <TabsTrigger value="badges">
            My Badges
          </TabsTrigger>
        </TabsList>

        {/* Available Tab */}
        <TabsContent value="available" className="space-y-6 mt-6">
          {/* ✅ Recommended Section - only if has recommendations AND not searching */}
          {recommendedAssessments.length > 0 && !searchQuery && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold">
                  {userSkills.length > 0
                    ? 'Recommended for You'
                    : 'Popular Assessments'}
                </h2>
                {userSkills.length > 0 && (
                  <div className="flex gap-1">
                    {userSkills.slice(0, 3).map((skill: string) => (
                      <Badge key={skill} variant="skill" size="sm">
                        {skill}
                      </Badge>
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
            {recommendedAssessments.length > 0 &&
              otherAssessments.length > 0 &&
              !searchQuery && (
                <div className="flex items-center gap-2 pt-2">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                  <h2 className="text-lg font-semibold">All Assessments</h2>
                </div>
              )}

            {!searchQuery && (
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
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingAny}
                >
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