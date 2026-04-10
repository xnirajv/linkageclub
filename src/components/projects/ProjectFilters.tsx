'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'AI / ML',
  'DevOps',
  'Design',
  'Content Writing',
  'Marketing',
  'Other',
];
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'];
const BUDGET_RANGES = [
  { label: 'Under Rs. 10K', min: 0, max: 10000 },
  { label: 'Rs. 10K - Rs. 30K', min: 10000, max: 30000 },
  { label: 'Rs. 30K - Rs. 70K', min: 30000, max: 70000 },
  { label: 'Rs. 70K+', min: 70000, max: 9999999 },
];

export interface FilterState {
  category?: string;
  experienceLevel?: string;
  minBudget?: number;
  maxBudget?: number;
}

interface ProjectFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export function ProjectFilters({ onFilterChange, className }: ProjectFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = (selectedCategory ? 1 : 0) + (selectedLevel ? 1 : 0) + (selectedBudget ? 1 : 0);

  const applyFilters = (cat: string, lvl: string, bgt: string) => {
    const budgetRange = BUDGET_RANGES.find((range) => range.label === bgt);
    onFilterChange({
      category: cat || undefined,
      experienceLevel: lvl || undefined,
      minBudget: budgetRange?.min,
      maxBudget: budgetRange?.max,
    });
  };

  const handleCategoryClick = (cat: string) => {
    const nextCategory = selectedCategory === cat ? '' : cat;
    setSelectedCategory(nextCategory);
    applyFilters(nextCategory, selectedLevel, selectedBudget);
  };

  const handleLevelClick = (lvl: string) => {
    const nextLevel = selectedLevel === lvl ? '' : lvl;
    setSelectedLevel(nextLevel);
    applyFilters(selectedCategory, nextLevel, selectedBudget);
  };

  const handleBudgetClick = (bgt: string) => {
    const nextBudget = selectedBudget === bgt ? '' : bgt;
    setSelectedBudget(nextBudget);
    applyFilters(selectedCategory, selectedLevel, nextBudget);
  };

  const clearAll = () => {
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedBudget('');
    onFilterChange({});
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && <Badge variant="default">{activeCount}</Badge>}
        </Button>

        {selectedCategory && (
          <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => handleCategoryClick(selectedCategory)}>
            {selectedCategory} <X className="h-3 w-3" />
          </Badge>
        )}
        {selectedLevel && (
          <Badge variant="secondary" className="cursor-pointer gap-1 capitalize" onClick={() => handleLevelClick(selectedLevel)}>
            {selectedLevel} <X className="h-3 w-3" />
          </Badge>
        )}
        {selectedBudget && (
          <Badge variant="secondary" className="cursor-pointer gap-1" onClick={() => handleBudgetClick(selectedBudget)}>
            {selectedBudget} <X className="h-3 w-3" />
          </Badge>
        )}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-600">
            Clear all
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <p className="mb-2 text-sm font-medium">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Experience Level</p>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <Badge
                    key={lvl}
                    variant={selectedLevel === lvl ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => handleLevelClick(lvl)}
                  >
                    {lvl}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Budget Range</p>
              <div className="flex flex-wrap gap-2">
                {BUDGET_RANGES.map((range) => (
                  <Badge
                    key={range.label}
                    variant={selectedBudget === range.label ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleBudgetClick(range.label)}
                  >
                    {range.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
