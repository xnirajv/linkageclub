'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const skills = ['React', 'Python', 'UI/UX', 'Node.js', 'TypeScript', 'Figma', 'Django', 'AWS'];

export function TalentSearch() {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, skills, or location..."
          className="pl-9 rounded-xl"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => {
          const selected = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              onClick={() => setSelectedSkills(prev => selected ? prev.filter(s => s !== skill) : [...prev, skill])}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selected ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {skill}
            </button>
          );
        })}
        {selectedSkills.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedSkills([])} className="text-xs">
            <X className="h-3 w-3 mr-1" />Clear
          </Button>
        )}
      </div>
    </div>
  );
}