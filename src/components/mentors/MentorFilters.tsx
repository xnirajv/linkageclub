'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const EXPERTISE_OPTIONS = ['React', 'Node.js', 'Python', 'Data Science', 'AI/ML', 'DevOps', 'Mobile', 'UI/UX'];
const AVAILABILITY_OPTIONS = ['weekdays', 'evenings', 'weekends', 'flexible'];
const PRICE_RANGES = [
  { label: '< ₹500/hr', max: 500 },
  { label: '₹500–₹1K/hr', min: 500, max: 1000 },
  { label: '₹1K–₹2K/hr', min: 1000, max: 2000 },
  { label: '₹2K+/hr', min: 2000 },
];

interface MentorFiltersProps {
  onFilterChange: (filters: any) => void;
  className?: string;
}

export function MentorFilters({ onFilterChange, className }: MentorFiltersProps) {
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = selectedExpertise.length + (selectedAvailability ? 1 : 0) + (selectedPrice ? 1 : 0);

  const apply = (exp: string[], avail: string, price: string) => {
    const priceRange = PRICE_RANGES.find((r) => r.label === price);
    onFilterChange({
      expertise: exp.length ? exp : undefined,
      availability: avail || undefined,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
    });
  };

  const toggleExpertise = (e: string) => {
    const updated = selectedExpertise.includes(e)
      ? selectedExpertise.filter((x) => x !== e)
      : [...selectedExpertise, e];
    setSelectedExpertise(updated);
    apply(updated, selectedAvailability, selectedPrice);
  };

  const clearAll = () => {
    setSelectedExpertise([]);
    setSelectedAvailability('');
    setSelectedPrice('');
    onFilterChange({});
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && <Badge variant="default" size="sm">{activeCount}</Badge>}
        </Button>
        {selectedExpertise.map((e) => (
          <Badge key={e} variant="skill" className="gap-1 cursor-pointer" onClick={() => toggleExpertise(e)}>
            {e} <X className="h-3 w-3" />
          </Badge>
        ))}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-error-600">Clear all</Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((e) => (
                  <Badge
                    key={e}
                    variant={selectedExpertise.includes(e) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleExpertise(e)}
                  >
                    {e}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Availability</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map((a) => (
                  <Badge
                    key={a}
                    variant={selectedAvailability === a ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => {
                      const updated = selectedAvailability === a ? '' : a;
                      setSelectedAvailability(updated);
                      apply(selectedExpertise, updated, selectedPrice);
                    }}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Price Range</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((r) => (
                  <Badge
                    key={r.label}
                    variant={selectedPrice === r.label ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const updated = selectedPrice === r.label ? '' : r.label;
                      setSelectedPrice(updated);
                      apply(selectedExpertise, selectedAvailability, updated);
                    }}
                  >
                    {r.label}
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
