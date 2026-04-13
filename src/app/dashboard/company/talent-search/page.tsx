'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Briefcase, Clock, DollarSign, MapPin, MessageCircle, Search, Sparkles, Star, Trophy } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type SearchUser = {
  _id: string;
  name?: string;
  role?: string;
  location?: string;
  trustScore?: number;
  skills?: Array<{ name?: string }>;
  experience?: Array<{ title?: string }>;
};

type CompanyApplication = {
  _id?: string;
  proposedAmount?: number;
  proposedDuration?: number;
  applicantId?: {
    _id?: string;
    name?: string;
    trustScore?: number;
    location?: string;
    skills?: Array<{ name?: string }>;
    experience?: Array<{ title?: string }>;
  };
  projectId?: { title?: string };
  jobId?: { title?: string };
};

type TalentCard = {
  id: string;
  name: string;
  role: string;
  location: string;
  trustScore: number;
  experience: number;
  rateLabel: string;
  rateValue: number | null;
  availability: string;
  skills: string[];
  completedProjects?: number;
  avgRating?: number;
  recentProjects?: Array<{ title: string; rating?: number }>;
};

const filterSkills = ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'TypeScript', 'Next.js', 'Express'];

function dedupeById(items: TalentCard[]) {
  const seen = new Map<string, TalentCard>();
  items.forEach((item) => {
    if (!seen.has(item.id)) {
      seen.set(item.id, item);
    }
  });
  return Array.from(seen.values());
}

function toCandidateFromApplication(application: CompanyApplication): TalentCard | null {
  const applicant = application.applicantId;
  if (!applicant?._id || !applicant.name) {
    return null;
  }

  const rateValue =
    application.proposedAmount && application.proposedDuration
      ? Math.round(application.proposedAmount / Math.max(application.proposedDuration, 1))
      : null;

  const title = application.projectId?.title || application.jobId?.title;

  return {
    id: applicant._id,
    name: applicant.name,
    role: application.jobId ? 'Job Applicant' : 'Project Applicant',
    location: applicant.location || 'Remote',
    trustScore: applicant.trustScore || 0,
    experience: applicant.experience?.length || 0,
    rateLabel: rateValue ? `₹${rateValue}/day` : 'Rate not listed',
    rateValue,
    availability: 'Available based on application activity',
    skills: (applicant.skills || []).map((skill) => skill.name || '').filter(Boolean),
    completedProjects: applicant.experience?.length || 0,
    recentProjects: title ? [{ title }] : [],
  };
}

function toCandidateFromSearchUser(user: SearchUser): TalentCard {
  return {
    id: user._id,
    name: user.name || 'Candidate',
    role: user.role === 'student' ? 'Student Candidate' : 'Candidate',
    location: user.location || 'Remote',
    trustScore: user.trustScore || 0,
    experience: user.experience?.length || 0,
    rateLabel: 'Rate not listed',
    rateValue: null,
    availability: 'Availability not listed',
    skills: (user.skills || []).map((skill) => skill.name || '').filter(Boolean),
    completedProjects: user.experience?.length || 0,
  };
}

export default function TalentSearchPage() {
  const { applications = [] } = useApplications({ role: 'company', limit: 100 });
  const typedApplications = applications as CompanyApplication[];
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minTrustScore, setMinTrustScore] = useState(80);
  const [maxRate, setMaxRate] = useState(2000);
  const [sortBy, setSortBy] = useState('match');
  const [savedCandidates, setSavedCandidates] = useState<string[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
      if (query.trim().length < 2) {
        setSearchedUsers([]);
        setSearchError(null);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          role: 'student',
          minTrustScore: String(minTrustScore),
        });
        const response = await apiClient.get<{ users?: SearchUser[] }>(`/api/search/users?${params.toString()}`);
        if (active) {
          setSearchedUsers(response.users || []);
        }
      } catch (error) {
        if (active) {
          setSearchError(error instanceof Error ? error.message : 'Failed to search candidates.');
          setSearchedUsers([]);
        }
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    };

    void runSearch();

    return () => {
      active = false;
    };
  }, [query, minTrustScore]);

  const applicantsPool = useMemo(() => {
    return dedupeById(
      typedApplications
        .map((application) => toCandidateFromApplication(application))
        .filter(Boolean) as TalentCard[]
    );
  }, [typedApplications]);

  const searchPool = useMemo(() => dedupeById(searchedUsers.map(toCandidateFromSearchUser)), [searchedUsers]);

  const basePool = query.trim().length >= 2 ? searchPool : applicantsPool;

  const candidates = useMemo(() => {
    let result = basePool.filter((talent) => {
      const searchMatch =
        !query.trim() ||
        query.trim().length < 2 ||
        talent.name.toLowerCase().includes(query.toLowerCase()) ||
        talent.role.toLowerCase().includes(query.toLowerCase()) ||
        talent.location.toLowerCase().includes(query.toLowerCase()) ||
        talent.skills.some((skill) => skill.toLowerCase().includes(query.toLowerCase()));

      const trustMatch = talent.trustScore >= minTrustScore;
      const rateMatch = talent.rateValue === null || talent.rateValue <= maxRate;
      const skillsMatch = selectedSkills.length === 0 || selectedSkills.some((skill) => talent.skills.includes(skill));
      return searchMatch && trustMatch && rateMatch && skillsMatch;
    });

    if (sortBy === 'trust') {
      result = [...result].sort((a, b) => b.trustScore - a.trustScore);
    } else if (sortBy === 'rate') {
      result = [...result].sort((a, b) => (a.rateValue ?? Number.MAX_SAFE_INTEGER) - (b.rateValue ?? Number.MAX_SAFE_INTEGER));
    } else if (sortBy === 'experience') {
      result = [...result].sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    } else {
      result = [...result].sort((a, b) => b.trustScore - a.trustScore);
    }

    return result;
  }, [basePool, maxRate, minTrustScore, query, selectedSkills, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
          <Sparkles className="h-3.5 w-3.5" />
          Talent Search
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">Find pre-verified candidates</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Browse real applicants from your company funnel, or search the wider platform once you start typing.</p>
      </div>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardContent className="space-y-5 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by skills, name, or location..." className="pl-9" />
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Skills</div>
              <div className="flex flex-wrap gap-2">
                {filterSkills.map((skill) => {
                  const selected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setSelectedSkills((prev) => selected ? prev.filter((item) => item !== skill) : [...prev, skill])}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selected ? 'bg-primary-700 text-white' : 'bg-silver-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-300'}`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Trust Score</div>
              <input type="range" min="70" max="100" step="5" value={minTrustScore} onChange={(e) => setMinTrustScore(parseInt(e.target.value, 10))} className="w-full" />
              <div className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">{minTrustScore}%+</div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Max Rate</div>
              <input type="range" min="500" max="5000" step="100" value={maxRate} onChange={(e) => setMaxRate(parseInt(e.target.value, 10))} className="w-full" />
              <div className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">₹{maxRate}/day</div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Sort</div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg border border-primary-200 bg-white px-3 py-1.5 text-xs dark:border-white/10 dark:bg-charcoal-950"
              >
                <option value="match">Best Match</option>
                <option value="trust">Trust Score</option>
                <option value="rate">Rate (Low)</option>
                <option value="experience">Experience</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
              {query.trim().length >= 2 ? `${candidates.length} platform matches` : `${candidates.length} real candidates from your company pipeline`}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setQuery('');
                setSelectedSkills([]);
                setMinTrustScore(80);
                setMaxRate(2000);
                setSortBy('match');
                setSearchError(null);
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Candidates</CardTitle>
          <div className="text-sm text-charcoal-500 dark:text-charcoal-400">{candidates.length}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchLoading && (
            <div className="rounded-[24px] bg-silver-50/70 p-4 text-sm text-charcoal-500">Searching candidates...</div>
          )}
          {searchError && (
            <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{searchError}</div>
          )}
          {!searchLoading && candidates.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              {query.trim().length >= 2 ? 'No candidates match your current platform search.' : 'No company applicants available yet. Once candidates apply, they will appear here automatically.'}
            </div>
          ) : (
            candidates.map((talent) => (
              <div key={talent.id} className="rounded-[20px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40 transition hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-info-500 text-lg font-semibold text-white">
                        {talent.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{talent.name}</h3>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{talent.role}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-primary-700" />
                        <span>Trust Score: <span className="font-semibold">{talent.trustScore}%</span></span>
                        {talent.avgRating ? (
                          <>
                            <span className="text-charcoal-400">•</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{talent.avgRating}/5</span>
                          </>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-secondary-700" />
                          {talent.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-primary-700" />
                          {talent.experience} years
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-info-700" />
                          {talent.availability}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-secondary-700" />
                          {talent.rateLabel}
                        </div>
                      </div>
                      {typeof talent.completedProjects === 'number' && (
                        <div className="text-xs text-charcoal-500 dark:text-charcoal-400">{talent.completedProjects} tracked experience entries</div>
                      )}
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {talent.skills.map((skill) => (
                          <span key={`${talent.id}-${skill}`} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800 dark:bg-primary-950/40 dark:text-primary-400">{skill}</span>
                        ))}
                      </div>
                    </div>

                    {talent.recentProjects && talent.recentProjects.length > 0 && (
                      <div className="border-t border-charcoal-200 pt-2 dark:border-charcoal-800">
                        <div className="mb-2 text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Recent Work</div>
                        <div className="space-y-1">
                          {talent.recentProjects.map((project, idx) => (
                            <div key={`${talent.id}-${idx}`} className="text-sm text-charcoal-600 dark:text-charcoal-300">{project.title}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[200px] lg:flex-col">
                    <Button asChild size="sm">
                      <Link href="/dashboard/company/post-project">Hire Now</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSavedCandidates((prev) => prev.includes(talent.id) ? prev.filter((id) => id !== talent.id) : [...prev, talent.id])}
                      className={savedCandidates.includes(talent.id) ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400' : ''}
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      {savedCandidates.includes(talent.id) ? 'Saved' : 'Save'}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/dashboard/messages">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-lg text-charcoal-950 dark:text-white">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[20px] border border-primary-100/70 bg-primary-50/70 p-4 text-sm dark:border-primary-800/30 dark:bg-primary-950/20">
              <p className="font-medium text-primary-900 dark:text-primary-300">High Trust Applicants</p>
              <p className="mt-1 text-xs text-primary-700 dark:text-primary-400">Based on live company application data</p>
            </div>
            <div className="rounded-[20px] border border-primary-100/70 bg-primary-50/70 p-4 text-sm dark:border-primary-800/30 dark:bg-primary-950/20">
              <p className="font-medium text-primary-900 dark:text-primary-300">Platform Search</p>
              <p className="mt-1 text-xs text-primary-700 dark:text-primary-400">Start typing at least 2 characters to search the wider user base</p>
            </div>
            <Button size="sm" variant="outline">Create Saved Search</Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Trophy className="mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <div className="text-lg font-semibold">Live Talent Funnel</div>
                <div className="mt-2 text-sm leading-6 text-white/90">The default list now comes from real candidates who have already entered your hiring funnel, while typed search expands to platform users.</div>
                <Button size="sm" variant="secondary" className="mt-3">Use Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
