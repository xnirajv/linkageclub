'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const CATEGORIES = ['Web Development', 'Mobile', 'Data Science', 'AI/ML', 'DevOps', 'Design', 'Other'];
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'];
const BUDGET_RANGES = [
  { label: '< ₹10K', min: 0, max: 10000 },
  { label: '₹10K–₹30K', min: 10000, max: 30000 },
  { label: '₹30K–₹70K', min: 30000, max: 70000 },
  { label: '₹70K+', min: 70000, max: 9999999 },
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
    const budgetRange = BUDGET_RANGES.find((r) => r.label === bgt);
    onFilterChange({
      category: cat || undefined,
      experienceLevel: lvl || undefined,
      minBudget: budgetRange?.min,
      maxBudget: budgetRange?.max,
    });
  };

  const handleCategoryClick = (cat: string) => {
    const newCat = selectedCategory === cat ? '' : cat;
    setSelectedCategory(newCat);
    applyFilters(newCat, selectedLevel, selectedBudget);
  };

  const handleLevelClick = (lvl: string) => {
    const newLvl = selectedLevel === lvl ? '' : lvl;
    setSelectedLevel(newLvl);
    applyFilters(selectedCategory, newLvl, selectedBudget);
  };

  const handleBudgetClick = (bgt: string) => {
    const newBgt = selectedBudget === bgt ? '' : bgt;
    setSelectedBudget(newBgt);
    applyFilters(selectedCategory, selectedLevel, newBgt);
  };

  const clearAll = () => {
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedBudget('');
    onFilterChange({});
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && <Badge variant="default">{activeCount}</Badge>}
        </Button>

        {selectedCategory && (
          <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => handleCategoryClick(selectedCategory)}>
            {selectedCategory} <X className="h-3 w-3" />
          </Badge>
        )}
        {selectedLevel && (
          <Badge variant="secondary" className="gap-1 cursor-pointer capitalize" onClick={() => handleLevelClick(selectedLevel)}>
            {selectedLevel} <X className="h-3 w-3" />
          </Badge>
        )}
        {selectedBudget && (
          <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => handleBudgetClick(selectedBudget)}>
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
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Category</p>
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
              <p className="text-sm font-medium mb-2">Experience Level</p>
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
              <p className="text-sm font-medium mb-2">Budget Range</p>
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