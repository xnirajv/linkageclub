'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Star, MapPin, Briefcase, Bookmark, MessageCircle, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useApplications } from '@/hooks/useApplications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const skillFilters = ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'TypeScript', 'Next.js', 'Express'];

export default function TalentSearchPage() {
  const { applications = [] } = useApplications({ role: 'company', limit: 100 });
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minTrust, setMinTrust] = useState(80);
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setSearchedUsers([]); return; }
    const run = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<{ users?: any[] }>(`/api/search/users?q=${query}&role=student&minTrustScore=${minTrust}`);
        setSearchedUsers(res.users || []);
      } catch { setSearchedUsers([]); }
      finally { setLoading(false); }
    };
    void run();
  }, [query, minTrust]);

  const candidates = useMemo(() => {
    const pool = query.length >= 2 ? searchedUsers : (applications as any[]).map((a: any) => ({
      _id: a.applicantId?._id, name: a.applicantId?.name, trustScore: a.applicantId?.trustScore,
      location: a.applicantId?.location, skills: a.applicantId?.skills || [],
      role: 'Applicant', experience: a.applicantId?.experience?.length || 0,
    }));
    return pool.filter((c: any) => {
      if (selectedSkills.length > 0 && !selectedSkills.some(s => (c.skills || []).some((sk: any) => (sk.name || sk).toLowerCase().includes(s.toLowerCase())))) return false;
      return (c.trustScore || 0) >= minTrust;
    });
  }, [searchedUsers, applications, query, selectedSkills, minTrust]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs font-medium text-gray-500 mb-3">
          <Sparkles className="h-3 w-3" />Talent Search
        </div>
        <h1 className="text-2xl font-bold">Find Talent</h1>
        <p className="text-gray-500 mt-1">Search for skilled candidates</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or skill (min 2 chars)..." className="pl-9 rounded-xl" />
      </div>

      <div className="flex flex-wrap gap-2">
        {skillFilters.map((skill) => {
          const selected = selectedSkills.includes(skill);
          return (
            <button key={skill} onClick={() => setSelectedSkills(prev => selected ? prev.filter(s => s !== skill) : [...prev, skill])}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selected ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {skill}
            </button>
          );
        })}
      </div>

      {loading && <Skeleton className="h-32 rounded-xl" />}

      {!loading && candidates.length === 0 && (
        <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none"><CardContent className="p-12 text-center"><Search className="h-8 w-8 text-gray-400 mx-auto mb-2" /><p className="text-gray-500">{query.length < 2 ? 'Start typing to search' : 'No candidates found'}</p></CardContent></Card>
      )}

      <div className="space-y-3">
        {candidates.map((c: any, i: number) => (
          <Card key={c._id || i} className="border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold flex-shrink-0">
                    {(c.name || 'C')[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-current" />{c.trustScore || 0}%</span>
                    </div>
                    {(c.skills || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(c.skills || []).slice(0, 5).map((s: any) => <Badge key={s.name || s} variant="secondary" className="text-[10px]">{s.name || s}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost"><Bookmark className="h-4 w-4" /></Button>
                  <Button size="sm" asChild><Link href="/dashboard/messages"><MessageCircle className="h-4 w-4" /></Link></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}