'use client';

import * as React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Briefcase, FileText, Loader2, Search, Sparkles, UserRound, Users } from 'lucide-react';
import { SearchInput } from '@/components/forms/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from '@/hooks/useDebounce';
import { fetcher } from '@/lib/api/client';

interface SearchEntity {
  _id: string;
  title?: string;
  name?: string;
  message?: string;
  description?: string;
  content?: string;
  link?: string;
  category?: string;
  role?: string;
  location?: string;
  companyId?: {
    name?: string;
  };
  authorId?: {
    name?: string;
  };
  userId?: {
    name?: string;
  };
  matchScore?: number;
}

interface SearchResponse {
  query: string;
  results: {
    projects: SearchEntity[];
    jobs: SearchEntity[];
    mentors: SearchEntity[];
    users: SearchEntity[];
    posts: SearchEntity[];
  };
  counts: {
    total: number;
    projects: number;
    jobs: number;
    mentors: number;
    users: number;
    posts: number;
  };
}

const resultSections = [
  { key: 'projects', label: 'Projects', icon: Briefcase },
  { key: 'jobs', label: 'Jobs', icon: Sparkles },
  { key: 'mentors', label: 'Mentors', icon: Users },
  { key: 'users', label: 'People', icon: UserRound },
  { key: 'posts', label: 'Community', icon: FileText },
] as const;

export default function DashboardSearchPage() {
  const [query, setQuery] = React.useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);

  const { data, error, isLoading } = useSWR<SearchResponse>(
    debouncedQuery.length >= 2 ? `/api/search/global?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary-100 via-white to-info-100 shadow-[0_24px_70px_-34px_rgba(75,73,69,0.34)] dark:from-charcoal-900 dark:via-charcoal-900 dark:to-charcoal-800">
        <CardHeader className="space-y-4">
          <div className="inline-flex w-fit rounded-full bg-card/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-charcoal-700 dark:bg-card/10 dark:text-charcoal-300">
            Workspace search
          </div>
          <div>
            <CardTitle className="text-3xl text-charcoal-950 dark:text-white">Find anything across InternHub</CardTitle>
            <CardDescription className="mt-2 max-w-2xl text-sm text-charcoal-600 dark:text-charcoal-400">
              Search projects, jobs, mentors, people, and community posts from one place.
            </CardDescription>
          </div>
          <SearchInput
            placeholder="Search projects, jobs, mentors, people, or posts..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="max-w-2xl"
            debounceMs={0}
          />
        </CardHeader>
      </Card>

      {query.trim().length < 2 ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-charcoal-600 dark:text-charcoal-400">
            <Search className="h-5 w-5 text-primary-600" />
            Start typing at least 2 characters to search your workspace.
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-charcoal-600 dark:text-charcoal-400">
            <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
            Searching across your workspace
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">
            Search failed. Please try again in a moment.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5">
              {data?.counts.total || 0} results
            </Badge>
            <span className="text-sm text-charcoal-600 dark:text-charcoal-400">
              Showing matches for <strong>{data?.query || debouncedQuery}</strong>
            </span>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {resultSections.map((section) => {
              const Icon = section.icon;
              const items = data?.results[section.key] || [];

              return (
                <Card key={section.key} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary-100 p-2 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{section.label}</CardTitle>
                          <CardDescription>{items.length} matches</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {items.length === 0 ? (
                      <p className="rounded-2xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                        No {section.label.toLowerCase()} matched this search.
                      </p>
                    ) : (
                      items.map((item) => (
                        <Link
                          key={item._id}
                          href={item.link || '#'}
                          className="block rounded-[22px] border border-black/5 bg-card/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-charcoal-900/70"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-charcoal-950 dark:text-white">
                                {item.title || item.name || 'Untitled result'}
                              </p>
                              <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-400">
                                {item.companyId?.name || item.userId?.name || item.authorId?.name || item.role || item.category || item.location || 'Workspace result'}
                              </p>
                            </div>
                            {typeof item.matchScore === 'number' && (
                              <Badge className="rounded-full bg-secondary-100 text-charcoal-900">
                                {item.matchScore}% match
                              </Badge>
                            )}
                          </div>
                          {(item.description || item.content || item.message) && (
                            <p className="mt-3 line-clamp-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                              {item.description || item.content || item.message}
                            </p>
                          )}
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
