'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';

export function AssessmentFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({ skill: 'all', level: 'all', price: 'all' });

  const { data: skillsData } = useSWR<{ skills: string[] }>('/api/assessments/skills', fetcher);
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

  const activeCount = Object.values(filters).filter(v => v !== 'all').length;

  return (
    <Card className="p-4">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-2 bg-gray-100 rounded-lg md:hidden">
        <div className="flex items-center gap-2"><Filter className="h-4 w-4" /><span className="font-medium">Filters</span>{activeCount > 0 && <Badge variant="destructive">{activeCount}</Badge>}</div>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </button>
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block space-y-4`}>
        <div><h4 className="text-sm font-medium mb-2">Skill</h4><select value={filters.skill} onChange={(e) => handleFilterChange('skill', e.target.value)} className="w-full rounded-md border p-2"><option value="all">All Skills</option>{skills.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><h4 className="text-sm font-medium mb-2">Difficulty Level</h4><div className="flex flex-wrap gap-2">{levels.map(l => <button key={l.value} onClick={() => handleFilterChange('level', l.value)} className={`px-3 py-1 rounded-full text-sm ${filters.level === l.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{l.label}</button>)}</div></div>
        <div><h4 className="text-sm font-medium mb-2">Price</h4><div className="flex flex-wrap gap-2">{priceOptions.map(p => <button key={p.value} onClick={() => handleFilterChange('price', p.value)} className={`px-3 py-1 rounded-full text-sm ${filters.price === p.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p.label}</button>)}</div></div>
        {activeCount > 0 && (<div className="pt-2 border-t"><div className="flex items-center justify-between mb-2"><h4 className="text-sm font-medium">Active Filters</h4><Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3 w-3 mr-1" />Clear all</Button></div><div className="flex flex-wrap gap-2">{filters.skill !== 'all' && <Badge variant="secondary" className="flex items-center gap-1">Skill: {filters.skill}<X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('skill', 'all')} /></Badge>}{filters.level !== 'all' && <Badge variant="secondary" className="flex items-center gap-1">Level: {filters.level}<X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('level', 'all')} /></Badge>}{filters.price !== 'all' && <Badge variant="secondary" className="flex items-center gap-1">Price: {filters.price === 'free' ? 'Free' : 'Paid'}<X className="h-3 w-3 cursor-pointer" onClick={() => handleFilterChange('price', 'all')} /></Badge>}</div></div>)}
      </div>
    </Card>
  );
}