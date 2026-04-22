'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';

// ✅ ADD THIS INTERFACE
interface SkillsResponse {
  skills: string[];
}

interface AssessmentFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function AssessmentFilters({ onFilterChange }: AssessmentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    skill: 'all',
    level: 'all',
    price: 'all',
  });

  // ✅ FIX: Add type to useSWR
  const { data: skillsData } = useSWR<SkillsResponse>('/api/assessments/skills', fetcher);
  const skills = skillsData?.skills || [];

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
  ];

  const priceOptions = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({ skill: 'all', level: 'all', price: 'all' });
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Mobile Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 bg-gray-100 rounded-lg md:hidden"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-1">{activeFilterCount}</Badge>
            )}
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Filter Content */}
        <div className={`${isExpanded ? 'block' : 'hidden'} md:block space-y-4`}>
          {/* Skill Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Skill</h4>
            <select
              value={filters.skill}
              onChange={(e) => handleFilterChange('skill', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm"
            >
              <option value="all">All Skills</option>
              {skills.map((skill: string) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Difficulty Level</h4>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleFilterChange('level', level.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.level === level.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Price</h4>
            <div className="flex flex-wrap gap-2">
              {priceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('price', option.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.price === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Active Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.skill !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Skill: {filters.skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('skill', 'all')} />
                  </Badge>
                )}
                {filters.level !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Level: {filters.level}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('level', 'all')} />
                  </Badge>
                )}
                {filters.price !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: {filters.price === 'free' ? 'Free' : 'Paid'}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('price', 'all')} />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}