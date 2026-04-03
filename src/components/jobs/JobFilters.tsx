'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { SlidersHorizontal, X } from 'lucide-react';

const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract', 'remote'];
const EXPERIENCE_LEVELS = ['fresher', 'junior', 'mid', 'senior', 'lead'];
const SALARY_RANGES = [
  { label: '< ₹5 LPA', min: 0, max: 500000 },
  { label: '₹5–10 LPA', min: 500000, max: 1000000 },
  { label: '₹10–20 LPA', min: 1000000, max: 2000000 },
  { label: '₹20+ LPA', min: 2000000, max: 99999999 },
];

interface JobFiltersProps {
  onFilterChange: (filters: any) => void;
  className?: string;
}

export function JobFilters({ onFilterChange, className }: JobFiltersProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [selectedSalary, setSelectedSalary] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount =
    selectedTypes.length + (selectedExperience ? 1 : 0) + (selectedSalary ? 1 : 0);

  const toggleType = (type: string) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    applyFilters(updated, selectedExperience, selectedSalary);
  };

  const selectExperience = (level: string) => {
    const updated = selectedExperience === level ? '' : level;
    setSelectedExperience(updated);
    applyFilters(selectedTypes, updated, selectedSalary);
  };

  const selectSalary = (range: string) => {
    const updated = selectedSalary === range ? '' : range;
    setSelectedSalary(updated);
    applyFilters(selectedTypes, selectedExperience, updated);
  };

  const applyFilters = (types: string[], experience: string, salary: string) => {
    const salaryRange = SALARY_RANGES.find((r) => r.label === salary);
    onFilterChange({
      type: types.length ? types : undefined,
      experience: experience || undefined,
      minSalary: salaryRange?.min,
      maxSalary: salaryRange?.max,
    });
  };

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedExperience('');
    setSelectedSalary('');
    onFilterChange({});
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {selectedTypes.map((type) => (
          <Badge
            key={type}
            variant="skill"
            className="gap-1 cursor-pointer"
            onClick={() => toggleType(type)}
          >
            {type}
            <X className="h-3 w-3" />
          </Badge>
        ))}
        {selectedExperience && (
          <Badge variant="skill" className="gap-1 cursor-pointer" onClick={() => selectExperience(selectedExperience)}>
            {selectedExperience}
            <X className="h-3 w-3" />
          </Badge>
        )}
        {selectedSalary && (
          <Badge variant="skill" className="gap-1 cursor-pointer" onClick={() => selectSalary(selectedSalary)}>
            {selectedSalary}
            <X className="h-3 w-3" />
          </Badge>
        )}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-error-600">
            Clear all
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Job Type</p>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Experience Level</p>
              <div className="flex flex-wrap gap-2">
                {EXPERIENCE_LEVELS.map((level) => (
                  <Badge
                    key={level}
                    variant={selectedExperience === level ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => selectExperience(level)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Salary Range</p>
              <div className="flex flex-wrap gap-2">
                {SALARY_RANGES.map((range) => (
                  <Badge
                    key={range.label}
                    variant={selectedSalary === range.label ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => selectSalary(range.label)}
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
