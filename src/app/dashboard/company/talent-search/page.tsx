'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Briefcase, GraduationCap, MapPin, Search, Sparkles, Star, Clock, DollarSign, Trophy, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TalentCard {
  id: string;
  name: string;
  role: string;
  location: string;
  trustScore: number;
  experience: number;
  rate: number;
  availability: string;
  skills: string[];
  completedProjects?: number;
  avgRating?: number;
  recentProjects?: Array<{ title: string; rating: number }>;
}

const talentPool: TalentCard[] = [
  { 
    id: '1', 
    name: 'Riya Sharma', 
    role: 'Full Stack Developer', 
    location: 'Mumbai, India', 
    trustScore: 95, 
    experience: 3, 
    rate: 1500, 
    availability: 'Immediate', 
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    completedProjects: 12,
    avgRating: 4.9,
    recentProjects: [{ title: 'E-commerce Platform', rating: 5 }, { title: 'Admin Dashboard', rating: 4.8 }]
  },
  { 
    id: '2', 
    name: 'Raj Patel', 
    role: 'Frontend Engineer', 
    location: 'Bangalore, India', 
    trustScore: 92, 
    experience: 4, 
    rate: 1200, 
    availability: 'Immediate', 
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    completedProjects: 18,
    avgRating: 4.7,
    recentProjects: [{ title: 'SaaS Dashboard', rating: 4.7 }, { title: 'Mobile App', rating: 4.6 }]
  },
  { 
    id: '3', 
    name: 'Priya Mehta', 
    role: 'Full Stack Engineer', 
    location: 'Remote', 
    trustScore: 90, 
    experience: 5, 
    rate: 1800, 
    availability: 'Immediate', 
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    completedProjects: 24,
    avgRating: 4.8,
    recentProjects: [{ title: 'Fintech Platform', rating: 5 }, { title: 'SaaS Product', rating: 4.8 }]
  },
  { 
    id: '4', 
    name: 'Vikram Singh', 
    role: 'Backend Developer', 
    location: 'Delhi, India', 
    trustScore: 88, 
    experience: 4, 
    rate: 1400, 
    availability: '2 weeks', 
    skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
    completedProjects: 16,
    avgRating: 4.6,
    recentProjects: [{ title: 'REST API Development', rating: 4.9 }, { title: 'Microservices', rating: 4.7 }]
  },
  { 
    id: '5', 
    name: 'Neha Gupta', 
    role: 'React Specialist', 
    location: 'Pune, India', 
    trustScore: 91, 
    experience: 3, 
    rate: 1300, 
    availability: 'Immediate', 
    skills: ['React', 'TypeScript', 'GraphQL', 'Next.js'],
    completedProjects: 14,
    avgRating: 4.8,
    recentProjects: [{ title: 'Content Management', rating: 4.9 }, { title: 'Real-time Chat', rating: 4.7 }]
  },
  { 
    id: '6', 
    name: 'Arjun Kumar', 
    role: 'Full Stack Developer', 
    location: 'Hyderabad, India', 
    trustScore: 87, 
    experience: 2, 
    rate: 1000, 
    availability: 'Immediate', 
    skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    completedProjects: 9,
    avgRating: 4.5,
    recentProjects: [{ title: 'Web App Development', rating: 4.5 }]
  },
];

const filterSkills = ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'TypeScript', 'Next.js', 'Express'];

export default function TalentSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minTrustScore, setMinTrustScore] = useState(80);
  const [maxRate, setMaxRate] = useState(2000);
  const [sortBy, setSortBy] = useState('match');
  const [savedCandidates, setSavedCandidates] = useState<string[]>([]);

  const candidates = useMemo(() => {
    let result = talentPool.filter((talent) => {
      const searchMatch =
        talent.name.toLowerCase().includes(query.toLowerCase()) ||
        talent.role.toLowerCase().includes(query.toLowerCase()) ||
        talent.skills.some((skill) => skill.toLowerCase().includes(query.toLowerCase()));
      const trustMatch = talent.trustScore >= minTrustScore;
      const rateMatch = talent.rate <= maxRate;
      const skillsMatch = selectedSkills.length === 0 || selectedSkills.some((skill) => talent.skills.includes(skill));
      return searchMatch && trustMatch && rateMatch && skillsMatch;
    });

    // Sort results
    if (sortBy === 'trust') {
      result.sort((a, b) => b.trustScore - a.trustScore);
    } else if (sortBy === 'rate') {
      result.sort((a, b) => a.rate - b.rate);
    } else if (sortBy === 'experience') {
      result.sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    }

    return result;
  }, [minTrustScore, query, selectedSkills, maxRate, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700">
          <Sparkles className="h-3.5 w-3.5" />
          Talent Search
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal-950 dark:text-white">Find pre-verified candidates</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Use premium search and trust-driven filtering to surface the strongest people for your company opportunities.</p>
      </div>

      {/* Search & Filters Card */}
      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardContent className="space-y-5 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by skills, name, or location..." className="pl-9" />
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            {/* Skills */}
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

            {/* Trust Score */}
            <div>
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Trust Score</div>
              <input type="range" min="70" max="100" step="5" value={minTrustScore} onChange={(e) => setMinTrustScore(parseInt(e.target.value, 10))} className="w-full" />
              <div className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">{minTrustScore}%+</div>
            </div>

            {/* Max Rate */}
            <div>
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Max Rate</div>
              <input type="range" min="500" max="3000" step="100" value={maxRate} onChange={(e) => setMaxRate(parseInt(e.target.value, 10))} className="w-full" />
              <div className="mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">₹{maxRate}/hr</div>
            </div>

            {/* Sort */}
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
              {candidates.length} candidates match your filters
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
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Candidates</CardTitle>
          <div className="text-sm text-charcoal-500 dark:text-charcoal-400">
            {candidates.length} of {talentPool.length}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidates.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No candidates match your criteria. Try adjusting filters.
            </div>
          ) : (
            candidates.map((talent) => (
              <div key={talent.id} className="rounded-[20px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40 transition hover:shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Candidate Info */}
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

                    {/* Stats Grid */}
                    <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-primary-700" />
                        <span>Trust Score: <span className="font-semibold">{talent.trustScore}%</span></span>
                        {talent.avgRating && (
                          <>
                            <span className="text-charcoal-400">•</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span>{talent.avgRating}/5</span>
                          </>
                        )}
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
                          ₹{talent.rate}/hr
                        </div>
                      </div>
                      {talent.completedProjects !== undefined && (
                        <div className="text-xs">
                          <span className="text-charcoal-500 dark:text-charcoal-400">{talent.completedProjects} projects completed</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <div className="mb-2 text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {talent.skills.map((skill) => (
                          <span key={skill} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800 dark:bg-primary-950/40 dark:text-primary-400">{skill}</span>
                        ))}
                      </div>
                    </div>

                    {/* Recent Projects */}
                    {talent.recentProjects && talent.recentProjects.length > 0 && (
                      <div className="pt-2 border-t border-charcoal-200 dark:border-charcoal-800">
                        <div className="mb-2 text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Recent Work</div>
                        <div className="space-y-1">
                          {talent.recentProjects.map((project, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm text-charcoal-600 dark:text-charcoal-300">
                              <span>{project.title}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < Math.floor(project.rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-charcoal-300 dark:text-charcoal-700'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-xs">({project.rating})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 lg:w-[200px] lg:flex-col">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/company/post-project`}>Hire Now</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSaved(talent.id)}
                      className={savedCandidates.includes(talent.id) ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400' : ''}
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      {savedCandidates.includes(talent.id) ? 'Saved' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Saved Searches & Tips */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-lg text-charcoal-950 dark:text-white">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[20px] border border-primary-100/70 bg-primary-50/70 p-4 text-sm dark:border-primary-800/30 dark:bg-primary-950/20">
              <p className="font-medium text-primary-900 dark:text-primary-300">React Developers (80+ Trust)</p>
              <p className="mt-1 text-xs text-primary-700 dark:text-primary-400">12 new matches this week</p>
            </div>
            <div className="rounded-[20px] border border-primary-100/70 bg-primary-50/70 p-4 text-sm dark:border-primary-800/30 dark:bg-primary-950/20">
              <p className="font-medium text-primary-900 dark:text-primary-300">Full Stack (Bangalore)</p>
              <p className="mt-1 text-xs text-primary-700 dark:text-primary-400">8 new matches this week</p>
            </div>
            <Button size="sm" variant="outline">Create Saved Search</Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <div className="text-lg font-semibold">Smart Matching</div>
                <div className="mt-2 text-sm leading-6 text-white/90">Use trust score combined with skill fit to identify the best candidates quickly. Save searches to track new matches automatically.</div>
                <Button size="sm" variant="secondary" className="mt-3">Learn More</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function toggleSaved(candidateId: string) {
    setSavedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  }
}
