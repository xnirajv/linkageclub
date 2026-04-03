'use client';

import React, { useState } from 'react';
import { JobFilters } from '@/components/jobs/JobFilters';
import { JobGrid } from '@/components/jobs/JobGrid';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useJobs } from '@/hooks/useJobs';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { jobs, pagination, isLoading, applyFilters, loadMore } = useJobs({
    search: debouncedSearch,
    ...filters,
  });

  const { jobs: savedJobs, isLoading: savedLoading } = useJobs({
    saved: true,
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
            Jobs
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Find your dream job from top companies
          </p>
        </div>

        <Tabs defaultValue="browse">
          <TabsList>
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="saved">Saved Jobs ({savedJobs.length})</TabsTrigger>
            <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="space-y-4">
              <SearchInput
                placeholder="Search jobs by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onClear={() => handleSearch('')}
              />

              <JobFilters onFilterChange={handleFilterChange} />

              <JobGrid
                jobs={jobs}
                isLoading={isLoading}
                emptyMessage="No jobs found matching your criteria"
              />

              {pagination && pagination.page < pagination.pages && (
                <div className="flex justify-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    isLoading={isLoading}
                  >
                    Load More Jobs
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <JobGrid
              jobs={savedJobs}
              isLoading={savedLoading}
              emptyMessage="No saved jobs"
            />
          </TabsContent>

          <TabsContent value="applied">
            <JobGrid
              jobs={jobs.filter((j: { hasApplied: any; }) => j.hasApplied)}
              isLoading={isLoading}
              emptyMessage="No applied jobs"
            />
          </TabsContent>
        </Tabs>
      </div>
  );
}