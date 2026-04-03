'use client';

import React, { useState } from 'react';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { projects, pagination, isLoading, applyFilters, loadMore } = useProjects({
    search: debouncedSearch,
    ...filters,
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
            Browse Projects
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            Find paid projects that match your skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <SearchInput
            placeholder="Search projects by title, skills, or company..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onClear={() => handleSearch('')}
          />

          <ProjectFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Projects Grid */}
        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          emptyMessage="No projects found matching your criteria"
        />

        {/* Load More */}
        {pagination && pagination.page < pagination.pages && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={loadMore}
              isLoading={isLoading}
            >
              Load More Projects
            </Button>
          </div>
        )}
      </div>
  );
}