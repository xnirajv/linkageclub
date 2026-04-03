'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '../forms/Slider';

interface AssessmentFiltersProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: {
    skill?: string;
    level?: string;
    price?: 'free' | 'paid' | 'all';
    search?: string;
  };
  skills?: string[];
}

export function AssessmentFilters({ onFilterChange, initialFilters = {}, skills = [] }: AssessmentFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [filters, setFilters] = React.useState({
    skill: initialFilters.skill || '',
    level: initialFilters.level || '',
    price: initialFilters.price || 'all',
    search: initialFilters.search || '',
    minPrice: 0,
    maxPrice: 5000,
  });

  const [selectedSkills, setSelectedSkills] = React.useState<string[]>(
    initialFilters.skill ? [initialFilters.skill] : []
  );

  const levels = [
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

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(newSkills);
    handleFilterChange('skill', newSkills.join(','));
  };

  const handlePriceRangeChange = (values: number[]) => {
    const newFilters = { ...filters, minPrice: values[0], maxPrice: values[1] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      skill: '',
      level: '',
      price: 'all',
      search: '',
      minPrice: 0,
      maxPrice: 5000,
    });
    setSelectedSkills([]);
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.level) count++;
    if (filters.price !== 'all') count++;
    if (selectedSkills.length > 0) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 5000) count++;
    return count;
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search assessments..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 bg-charcoal-100/50 rounded-lg md:hidden"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="destructive" size="sm">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Filter Content */}
        <div className={`${isExpanded ? 'block' : 'hidden'} md:block space-y-4`}>
          {/* Level Filter */}
          <div>
            <h4 className="text-sm font-medium mb-2">Difficulty Level</h4>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleFilterChange('level', level.value === filters.level ? '' : level.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.level === level.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-100'
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
                      : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          {filters.price === 'paid' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Price Range</h4>
                <span className="text-sm text-charcoal-500">
                  ₹{filters.minPrice} - ₹{filters.maxPrice}
                </span>
              </div>
              <Slider
                min={0}
                max={5000}
                step={100}
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={handlePriceRangeChange}
                className="mt-2"
              />
            </div>
          )}

          {/* Skills Filter */}
          {skills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary-600 text-white'
                        : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-100'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {getActiveFilterCount() > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Active Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.level && (
                  <Badge variant="destructive" size="sm" className="flex items-center gap-1">
                    Level: {filters.level}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange('level', '')}
                    />
                  </Badge>
                )}
                {filters.price !== 'all' && (
                  <Badge variant="destructive" size="sm" className="flex items-center gap-1">
                    Price: {filters.price}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleFilterChange('price', 'all')}
                    />
                  </Badge>
                )}
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="destructive" size="sm" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleSkillToggle(skill)}
                    />
                  </Badge>
                ))}
                {(filters.minPrice > 0 || filters.maxPrice < 5000) && (
                  <Badge variant="destructive" size="sm" className="flex items-center gap-1">
                    ₹{filters.minPrice} - ₹{filters.maxPrice}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setFilters({ ...filters, minPrice: 0, maxPrice: 5000 });
                        onFilterChange({ ...filters, minPrice: 0, maxPrice: 5000 });
                      }}
                    />
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