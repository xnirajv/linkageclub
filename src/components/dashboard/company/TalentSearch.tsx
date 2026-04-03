'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchBar } from '@/components/shared/SearchBar';
import { Star, MapPin, Filter, Search, X, Briefcase, Clock, Users, Sparkles } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/client';
import Link from 'next/link';

export function TalentSearch() {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useSWR<any>(
    debouncedQuery ? `/api/search/users?q=${debouncedQuery}&skills=${selectedSkills.join(',')}` : null,
    fetcher
  );

  const users = data?.users || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-charcoal-950 to-charcoal-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Find Talent
        </h1>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Search for skilled freelancers and professionals
        </p>
      </div>

      {/* Search Section */}
      <Card className="p-5 border-0 shadow-lg">
        <div className="relative">
          <SearchBar
            placeholder="Search by name, skills, or location..."
            onSearch={setQuery}
            className="w-full rounded-xl border-charcoal-200 dark:border-charcoal-700 pl-10"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 flex items-center gap-2 text-sm text-charcoal-500 hover:text-primary-600 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filters
          {selectedSkills.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedSkills.length} active
            </Badge>
          )}
        </button>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-800">
            <div className="flex flex-wrap gap-2">
              {['React', 'Python', 'UI/UX', 'Node.js', 'TypeScript', 'Figma', 'Django', 'AWS'].map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    if (selectedSkills.includes(skill)) {
                      setSelectedSkills(selectedSkills.filter(s => s !== skill));
                    } else {
                      setSelectedSkills([...selectedSkills, skill]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary-600 text-white'
                      : 'bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedSkills([])} className="mt-3 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-3" />
          <p className="text-muted-foreground">Searching for talent...</p>
        </div>
      )}

      {/* Empty State - No Query */}
      {!isLoading && !debouncedQuery && (
        <Card className="p-12 text-center border-0 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-charcoal-400" />
          </div>
          <p className="text-muted-foreground">Start searching for talent</p>
          <p className="text-xs text-muted-foreground mt-1">Enter a skill or name to find professionals</p>
        </Card>
      )}

      {/* Empty State - No Results */}
      {!isLoading && users.length === 0 && debouncedQuery && (
        <Card className="p-12 text-center border-0 shadow-lg">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
            <Search className="h-10 w-10 text-charcoal-400" />
          </div>
          <p className="text-muted-foreground">No talent found matching your search</p>
          <p className="text-xs text-muted-foreground mt-1">Try different keywords or adjust filters</p>
        </Card>
      )}

      {/* Results Grid */}
      {users.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Found <span className="font-semibold text-charcoal-950 dark:text-white">{users.length}</span> results
            </p>
          </div>
          
          {users.map((user: any) => (
            <Card key={user._id} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-gray-800">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-semibold text-lg">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white group-hover:text-primary-600 transition-colors">
                          {user.name}
                        </h3>
                        {user.location && (
                          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {user.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 px-2.5 py-1 rounded-full">
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                          {user.trustScore}%
                        </span>
                      </div>
                    </div>

                    {user.bio && (
                      <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mt-2 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {user.skills?.slice(0, 5).map((skill: any) => (
                        <Badge key={skill.name} variant="skill" size="sm" className="bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 self-end sm:self-center">
                    <Button size="sm" asChild variant="outline" className="gap-2">
                      <Link href={`/profile/${user.username || user._id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button size="sm" className="gap-2 bg-primary-600 hover:bg-primary-700">
                      <Briefcase className="h-4 w-4" />
                      Hire
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
