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
  _id: string; name?: string; role?: string; location?: string;
  trustScore?: number; skills?: Array<{ name?: string }>; experience?: Array<{ title?: string }>;
};

type CompanyApplication = {
  _id?: string; proposedAmount?: number; proposedDuration?: number;
  applicantId?: { _id?: string; name?: string; trustScore?: number; location?: string; skills?: Array<{ name?: string }>; experience?: Array<{ title?: string }> };
  projectId?: { title?: string }; jobId?: { title?: string };
};

type TalentCard = {
  id: string; name: string; role: string; location: string; trustScore: number;
  experience: number; rateLabel: string; rateValue: number | null; availability: string;
  skills: string[]; completedProjects?: number; avgRating?: number;
  recentProjects?: Array<{ title: string; rating?: number }>;
};

const filterSkills = ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'TypeScript', 'Next.js', 'Express'];

function dedupeById(items: TalentCard[]) {
  const seen = new Map<string, TalentCard>();
  items.forEach((item) => { if (!seen.has(item.id)) seen.set(item.id, item); });
  return Array.from(seen.values());
}

function toCandidateFromApplication(app: CompanyApplication): TalentCard | null {
  const applicant = app.applicantId;
  if (!applicant?._id || !applicant.name) return null;
  const rateValue = app.proposedAmount && app.proposedDuration ? Math.round(app.proposedAmount / Math.max(app.proposedDuration, 1)) : null;
  const title = app.projectId?.title || app.jobId?.title;
  return {
    id: applicant._id, name: applicant.name, role: app.jobId ? 'Job Applicant' : 'Project Applicant',
    location: applicant.location || 'Remote', trustScore: applicant.trustScore || 0,
    experience: applicant.experience?.length || 0,
    rateLabel: rateValue ? `₹${rateValue}/day` : 'Rate not listed', rateValue,
    availability: 'Available', skills: (applicant.skills || []).map((s) => s.name || '').filter(Boolean),
    completedProjects: applicant.experience?.length || 0,
    recentProjects: title ? [{ title }] : [],
  };
}

function toCandidateFromSearchUser(user: SearchUser): TalentCard {
  return {
    id: user._id, name: user.name || 'Candidate', role: user.role === 'student' ? 'Student' : 'Candidate',
    location: user.location || 'Remote', trustScore: user.trustScore || 0,
    experience: user.experience?.length || 0, rateLabel: 'Rate not listed', rateValue: null,
    availability: 'Not listed', skills: (user.skills || []).map((s) => s.name || '').filter(Boolean),
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

  useEffect(() => {
    let active = true;
    const runSearch = async () => {
      if (query.trim().length < 2) { setSearchedUsers([]); return; }
      setSearchLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim(), role: 'student', minTrustScore: String(minTrustScore) });
        const response = await apiClient.get<{ users?: SearchUser[] }>(`/api/search/users?${params.toString()}`);
        if (active) setSearchedUsers(response.users || []);
      } catch { if (active) setSearchedUsers([]); }
      finally { if (active) setSearchLoading(false); }
    };
    void runSearch();
    return () => { active = false; };
  }, [query, minTrustScore]);

  const applicantsPool = useMemo(() => dedupeById(typedApplications.map(toCandidateFromApplication).filter(Boolean) as TalentCard[]), [typedApplications]);
  const searchPool = useMemo(() => dedupeById(searchedUsers.map(toCandidateFromSearchUser)), [searchedUsers]);
  const basePool = query.trim().length >= 2 ? searchPool : applicantsPool;

  const candidates = useMemo(() => {
    let result = basePool.filter((t) => {
      const sMatch = !query.trim() || query.trim().length < 2 || t.name.toLowerCase().includes(query.toLowerCase()) || t.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));
      const trustMatch = t.trustScore >= minTrustScore;
      const rateMatch = t.rateValue === null || t.rateValue <= maxRate;
      const skillsMatch = selectedSkills.length === 0 || selectedSkills.some((s) => t.skills.includes(s));
      return sMatch && trustMatch && rateMatch && skillsMatch;
    });
    if (sortBy === 'trust') result = [...result].sort((a, b) => b.trustScore - a.trustScore);
    else if (sortBy === 'rate') result = [...result].sort((a, b) => (a.rateValue ?? Number.MAX_SAFE_INTEGER) - (b.rateValue ?? Number.MAX_SAFE_INTEGER));
    else result = [...result].sort((a, b) => b.trustScore - a.trustScore);
    return result;
  }, [basePool, maxRate, minTrustScore, query, selectedSkills, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary-700"><Sparkles className="h-3.5 w-3.5" />Talent Search</div>
        <h1 className="mt-4 text-3xl font-semibold">Find pre-verified candidates</h1>
        <p className="mt-2 text-sm text-gray-500">Browse real applicants from your company funnel, or search the wider platform.</p>
      </div>

      <Card className="border-none bg-card/80 shadow-lg">
        <CardContent className="space-y-5 p-5">
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by skills, name, or location..." className="pl-9" /></div>
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="lg:col-span-2"><div className="mb-2 text-sm font-medium">Skills</div><div className="flex flex-wrap gap-2">{filterSkills.map((skill) => { const selected = selectedSkills.includes(skill); return (<button key={skill} type="button" onClick={() => setSelectedSkills((prev) => selected ? prev.filter((s) => s !== skill) : [...prev, skill])} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selected ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-700'}`}>{skill}</button>); })}</div></div>
            <div><div className="mb-2 text-sm font-medium">Trust Score</div><input type="range" min="70" max="100" step="5" value={minTrustScore} onChange={(e) => setMinTrustScore(parseInt(e.target.value, 10))} className="w-full" /><div className="mt-2 text-xs text-gray-500">{minTrustScore}%+</div></div>
            <div><div className="mb-2 text-sm font-medium">Max Rate</div><input type="range" min="500" max="5000" step="100" value={maxRate} onChange={(e) => setMaxRate(parseInt(e.target.value, 10))} className="w-full" /><div className="mt-2 text-xs text-gray-500">₹{maxRate}/day</div></div>
            <div><div className="mb-2 text-sm font-medium">Sort</div><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-lg border p-1.5 text-xs"><option value="match">Best Match</option><option value="trust">Trust Score</option><option value="rate">Rate (Low)</option></select></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/80 shadow-lg">
        <CardHeader><CardTitle>Candidates ({candidates.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {searchLoading && <div className="rounded-2xl bg-gray-50 p-4 text-sm">Searching...</div>}
          {!searchLoading && candidates.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-gray-500">No candidates found.</div>}
          {!searchLoading && candidates.map((talent) => (
            <div key={talent.id} className="rounded-2xl border bg-gradient-to-b from-white to-gray-50 p-5 transition hover:shadow-lg">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-info-500 text-lg font-semibold text-white">{talent.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</div>
                    <div><h3 className="text-lg font-semibold">{talent.name}</h3><p className="text-sm text-gray-500">{talent.role}</p></div>
                  </div>
                  <div className="grid gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-3"><Trophy className="h-4 w-4 text-primary-700" /><span>Trust: <span className="font-semibold">{talent.trustScore}%</span></span></div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{talent.location}</div>
                      <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{talent.experience} yrs</div>
                      <div className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{talent.rateLabel}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">{talent.skills.map((skill) => (<span key={`${talent.id}-${skill}`} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">{skill}</span>))}</div>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[200px] lg:flex-col">
                  <Button asChild size="sm"><Link href="/dashboard/company/post-project">Hire Now</Link></Button>
                  <Button size="sm" variant="outline" onClick={() => setSavedCandidates((prev) => prev.includes(talent.id) ? prev.filter((id) => id !== talent.id) : [...prev, talent.id])} className={savedCandidates.includes(talent.id) ? 'bg-primary-50 text-primary-700' : ''}><Bookmark className="mr-2 h-4 w-4" />{savedCandidates.includes(talent.id) ? 'Saved' : 'Save'}</Button>
                  <Button asChild size="sm" variant="outline"><Link href="/dashboard/messages"><MessageCircle className="mr-2 h-4 w-4" />Message</Link></Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}