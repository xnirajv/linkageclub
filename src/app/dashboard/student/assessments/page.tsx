'use client';

import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AssessmentGrid } from '@/components/assessments/AssessmentGrid';
import { AssessmentFilters } from '@/components/assessments/AssessmentFilters';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { BadgeDisplay } from '@/components/dashboard/student/BadgeDisplay';
import { useAssessments } from '@/hooks/useAssessments';
import { useProfile } from '@/hooks/useProfile';
import { useDebounce } from '@/hooks/useDebounce';
import { RecommendedSection } from '@/components/assessments/RecommendedSection';
import { PopularSection } from '@/components/assessments/PopularSection';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';

interface UserAssessmentsResponse {
  assessments: Array<{
    id: string;
    title: string;
    skillName: string;
    level: string;
    passingScore: number;
    attempt: {
      score: number;
      passed: boolean;
      timeSpent: number;
      startedAt: string;
      completedAt: string | null;
      answers: number[];
    };
    badgeEarned: boolean;
  }>;
}

interface RecommendedResponse {
  assessments: Array<{
    id: string;
    title: string;
    skillName: string;
    level: string;
    price: number;
    duration: number;
    passRate: number;
    matchScore: number;
    trustBoost: number;
    badgeName: string | null;
  }>;
}

interface PopularResponse {
  assessments: Array<{
    id: string;
    title: string;
    skillName: string;
    level: string;
    price: number;
    duration: number;
    takenCount: number;
    rating: number;
    ratingCount: number;
  }>;
}

export default function StudentAssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { assessments, pagination, isLoading, applyFilters } = useAssessments({
    search: debouncedSearch,
    ...filters,
  });

  const { badges } = useProfile();

  const { data: userData } = useSWR<UserAssessmentsResponse>('/api/assessments/user', fetcher);
  const allUserAssessments = userData?.assessments || [];

  const attemptedIds = new Set(allUserAssessments.map((a: any) => a.id));

  // ✅ Transform user assessments to match AssessmentGrid type
  const inProgressAssessments = useMemo(() => {
    return allUserAssessments
      .filter((a: any) => a.attempt?.completedAt === null)
      .map((a: any) => ({
        _id: a.id,
        id: a.id,
        title: a.title,
        description: '', // User API doesn't return description
        skillName: a.skillName,
        level: a.level,
        price: 0,
        duration: 0,
        passingScore: a.passingScore,
        totalAttempts: 0,
        passRate: 0,
        averageScore: 0,
        userAttempt: {
          score: a.attempt?.score || 0,
          passed: a.attempt?.passed || false,
          completedAt: a.attempt?.completedAt,
          answers: a.attempt?.answers || [],
          timeSpent: a.attempt?.timeSpent || 0,
        },
      }));
  }, [allUserAssessments]);

  // ✅ Transform completed assessments to match AssessmentGrid type
  const completedAssessments = useMemo(() => {
    return allUserAssessments
      .filter((a: any) => a.attempt?.completedAt !== null)
      .map((a: any) => ({
        _id: a.id,
        id: a.id,
        title: a.title,
        description: '',
        skillName: a.skillName,
        level: a.level,
        price: 0,
        duration: 0,
        passingScore: a.passingScore,
        totalAttempts: 0,
        passRate: 0,
        averageScore: 0,
        userAttempt: {
          score: a.attempt?.score || 0,
          passed: a.attempt?.passed || false,
          completedAt: a.attempt?.completedAt,
          answers: a.attempt?.answers || [],
          timeSpent: a.attempt?.timeSpent || 0,
        },
      }));
  }, [allUserAssessments]);

  const availableAssessments = assessments.filter(
    (a: any) => !attemptedIds.has(a._id)
  );

  const { data: recommendedData } = useSWR<RecommendedResponse>('/api/assessments/recommended', fetcher);
  const { data: popularData } = useSWR<PopularResponse>('/api/assessments/featured', fetcher);

  const recommendedAssessments = recommendedData?.assessments ?? [];
  const popularAssessments = popularData?.assessments ?? [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Skill Assessments</h1>
        <p className="text-gray-500">Get verified and earn badges to boost your profile</p>
      </div>

      <Tabs defaultValue="available">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Available ({assessments.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressAssessments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedAssessments.length})</TabsTrigger>
          <TabsTrigger value="badges">My Badges ({badges?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6 mt-6">
          {recommendedAssessments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🎯 Recommended For You
                <span className="text-sm font-normal text-gray-500">(Based on your profile)</span>
              </h2>
              <RecommendedSection assessments={recommendedAssessments} />
            </div>
          )}

          {popularAssessments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🔥 Popular Assessments
              </h2>
              <PopularSection assessments={popularAssessments} />
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-4">📚 All Assessments</h2>
            <div className="space-y-4">
              <SearchInput
                placeholder="Search assessments by skill or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
              <AssessmentFilters onFilterChange={setFilters} />
              <AssessmentGrid assessments={availableAssessments} isLoading={isLoading} />
              {pagination && pagination.page < pagination.pages && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" onClick={() => applyFilters({ page: pagination.page + 1 })}>
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <AssessmentGrid assessments={inProgressAssessments} emptyMessage="No assessments in progress" />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <AssessmentGrid assessments={completedAssessments} emptyMessage="No completed assessments" />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <BadgeDisplay badges={badges || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}