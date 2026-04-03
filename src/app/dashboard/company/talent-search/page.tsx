'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Briefcase, GraduationCap, MapPin, Search, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TalentCard {
  id: string;
  name: string;
  role: string;
  location: string;
  trustScore: number;
  experience: string;
  rate: string;
  availability: string;
  skills: string[];
}

const talentPool: TalentCard[] = [
  { id: '1', name: 'Riya Sharma', role: 'Full Stack Developer', location: 'Mumbai, India', trustScore: 92, experience: '3 years', rate: 'Rs1,500/hour', availability: 'Immediate', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'] },
  { id: '2', name: 'Raj Patel', role: 'Frontend Engineer', location: 'Bangalore, India', trustScore: 88, experience: '4 years', rate: 'Rs1,200/hour', availability: '2 weeks', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'] },
  { id: '3', name: 'Priya Mehta', role: 'Mobile Product Designer', location: 'Remote', trustScore: 85, experience: '2 years', rate: 'Rs1,000/hour', availability: 'Immediate', skills: ['React Native', 'Flutter', 'UI/UX', 'Figma'] },
];

const filterSkills = ['React', 'Node.js', 'Python', 'MongoDB', 'AWS'];

export default function TalentSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minTrustScore, setMinTrustScore] = useState(80);

  const candidates = useMemo(() => {
    return talentPool.filter((talent) => {
      const searchMatch =
        talent.name.toLowerCase().includes(query.toLowerCase()) ||
        talent.role.toLowerCase().includes(query.toLowerCase()) ||
        talent.skills.some((skill) => skill.toLowerCase().includes(query.toLowerCase()));
      const trustMatch = talent.trustScore >= minTrustScore;
      const skillsMatch = selectedSkills.length === 0 || selectedSkills.every((skill) => talent.skills.includes(skill));
      return searchMatch && trustMatch && skillsMatch;
    });
  }, [minTrustScore, query, selectedSkills]);

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

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardContent className="space-y-5 p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by skills, name, or location..." className="pl-9" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div>
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Skill Filters</div>
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
              <div className="mb-2 text-sm font-medium text-charcoal-800 dark:text-charcoal-200">Minimum Trust Score</div>
              <input type="range" min="70" max="100" step="5" value={minTrustScore} onChange={(e) => setMinTrustScore(parseInt(e.target.value, 10))} className="w-full" />
              <div className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">{minTrustScore}% and above</div>
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-300">
                {candidates.length} candidates match your current filters.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-charcoal-950 dark:text-white">Candidate Results</CardTitle>
          <div className="text-sm text-charcoal-500 dark:text-charcoal-400">Showing {candidates.length} of {talentPool.length}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidates.map((talent) => (
            <div key={talent.id} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-lg font-semibold text-primary-800">
                      {talent.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{talent.name}</h3>
                      <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{talent.role}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                    <div className="flex items-center gap-2"><Star className="h-4 w-4 text-secondary-600" />Trust Score: {talent.trustScore}%</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-info-700" />{talent.location}</div>
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary-700" />{talent.experience}</div>
                    <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-charcoal-600" />{talent.availability}</div>
                    <div>{talent.rate}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {talent.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[230px] lg:flex-col">
                  <Button asChild size="sm">
                    <Link href={`/profile/${talent.id}`}>View Full Profile</Link>
                  </Button>
                  <Button size="sm" variant="outline">Request Interview</Button>
                  <Button size="sm" variant="outline">Message</Button>
                  <Button size="sm" variant="ghost">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-primary-200 bg-silver-50/70 p-8 text-center text-sm text-charcoal-500 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-400">
              No candidates match the current search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-xl text-charcoal-950 dark:text-white">Saved Searches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700">
              React Developers (80+ Trust Score) • 12 new this week
            </div>
            <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700">
              Full Stack (Bangalore) • 8 new this week
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
          <CardContent className="p-6">
            <div className="text-xl font-semibold">Use trust score plus skill fit for faster shortlists.</div>
            <div className="mt-3 text-sm leading-7 text-white/80">This page now gives your company a premium sourcing surface that aligns with the new dashboard shell and hiring flow.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
