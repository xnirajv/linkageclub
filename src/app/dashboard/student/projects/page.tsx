'use client';

import React, { useState } from 'react';
import { ProjectFilters, type FilterState } from '@/components/projects/ProjectFilters';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { SearchInput } from '@/components/forms/SearchInput';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/useProjects';
import { useDebounce } from '@/hooks/useDebounce';

export default function StudentProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({});
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { projects, pagination, isLoading, applyFilters, loadMore } = useProjects({
    search: debouncedSearch,
    ...filters,
  });

  const handleSearch = (value: string) => setSearchQuery(value);

  // ✅ Fix: Type as FilterState to match ProjectFilters
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 dark:text-white">
          Browse Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find paid projects that match your skills
        </p>
      </div>

      <div className="space-y-4">
        <SearchInput
          placeholder="Search projects by title, skills, or company..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onClear={() => handleSearch('')}
        />
        <ProjectFilters onFilterChange={handleFilterChange} />
      </div>

      <ProjectGrid
        projects={projects}
        isLoading={isLoading}
        emptyMessage="No projects found matching your criteria"
      />

      {pagination && pagination.page < pagination.pages && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            Load More Projects
          </Button>
        </div>
      )}
    </div>
  );
}