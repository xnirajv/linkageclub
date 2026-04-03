'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FilterOption {
  key: string;
  label: string;
  value: any;
}

interface FilterBarProps {
  filters: FilterOption[];
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterBar({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Filters:</span>
      {filters.map((filter) => (
        <div
          key={filter.key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
        >
          <span>{filter.label}: {filter.value}</span>
          <button
            onClick={() => onRemoveFilter(filter.key)}
            className="hover:bg-primary-200 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-xs"
      >
        Clear all
      </Button>
    </div>
  );
}