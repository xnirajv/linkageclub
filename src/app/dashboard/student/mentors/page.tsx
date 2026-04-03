'use client';

import React, { useState } from 'react';
import { MentorFilters } from '@/components/mentors/MentorFilters';
import { MentorGrid } from '@/components/mentors/MentorGrid';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useMentors } from '@/hooks/useMentors';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentMentorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { mentors, pagination, isLoading, applyFilters, loadMore } = useMentors({
    search: debouncedSearch,
    ...filters,
  });

  const { mentors: recommendedMentors } = useMentors({
    recommended: true,
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Find a Mentor
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Learn from industry experts through 1-on-1 sessions
          </p>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Mentors</TabsTrigger>
            <TabsTrigger value="recommended">Recommended for You</TabsTrigger>
            <TabsTrigger value="saved">Saved Mentors</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="space-y-4">
              <SearchInput
                placeholder="Search mentors by name, expertise, or company..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onClear={() => handleSearch('')}
              />

              <MentorFilters onFilterChange={handleFilterChange} />

              <MentorGrid
                mentors={mentors}
                isLoading={isLoading}
                emptyMessage="No mentors found matching your criteria"
              />

              {pagination && pagination.page < pagination.pages && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    isLoading={isLoading}
                  >
                    Load More Mentors
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recommended">
            <MentorGrid
              mentors={recommendedMentors}
              isLoading={isLoading}
              emptyMessage="No recommendations available"
            />
          </TabsContent>

          <TabsContent value="saved">
            <MentorGrid
              mentors={mentors.filter((m: { isSaved: any; }) => m.isSaved)}
              isLoading={isLoading}
              emptyMessage="No saved mentors"
            />
          </TabsContent>
        </Tabs>
      </div>
  );
}