'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MessageSquare, Search, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const applicationsData = [
  { id: 'app1', name: 'Riya Sharma', trustScore: 92, location: 'Mumbai', status: 'shortlisted', proposedAmount: 'Rs55,000', proposedDuration: '28 days', coverLetter: 'Strong e-commerce and React delivery experience.' },
  { id: 'app2', name: 'Amit Kumar', trustScore: 88, location: 'Bangalore', status: 'pending', proposedAmount: 'Rs60,000', proposedDuration: '25 days', coverLetter: 'MERN stack specialist with product and cloud experience.' },
  { id: 'app3', name: 'Priya Patel', trustScore: 95, location: 'Pune', status: 'accepted', proposedAmount: 'Rs58,000', proposedDuration: '30 days', coverLetter: 'Deep commerce integrations and premium UI delivery background.' },
];

export default function ProjectApplicationsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'pending' | 'shortlisted' | 'accepted' | 'rejected'>('all');

  const filtered = useMemo(() => {
    return applicationsData.filter((application) => {
      const searchMatch = application.name.toLowerCase().includes(query.toLowerCase());
      const statusMatch = status === 'all' || application.status === status;
      return searchMatch && statusMatch;
    });
  }, [query, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Project Applications</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Review applicants for this project with shortlist, interview, and communication actions in the premium company workflow.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total', `${applicationsData.length}`],
          ['Pending', `${applicationsData.filter((item) => item.status === 'pending').length}`],
          ['Shortlisted', `${applicationsData.filter((item) => item.status === 'shortlisted').length}`],
          ['Accepted', `${applicationsData.filter((item) => item.status === 'accepted').length}`],
        ].map(([title, value]) => (
          <Card key={title} className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardContent className="p-5">
              <div className="text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{title}</div>
              <div className="mt-3 text-2xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search applicants..." className="pl-9" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Applications ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {filtered.map((application) => (
            <div key={application.id} className="rounded-[28px] border border-primary-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(225,221,214,0.55))] p-5 dark:border-white/10 dark:bg-charcoal-950/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-sm font-semibold text-primary-800">
                      {application.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-charcoal-950 dark:text-white">{application.name}</div>
                      <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{application.location}</div>
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm text-charcoal-600 dark:text-charcoal-300 md:grid-cols-2">
                    <div className="flex items-center gap-2"><Star className="h-4 w-4 text-secondary-600" />Trust Score: {application.trustScore}%</div>
                    <div>Status: {application.status}</div>
                    <div>Proposed: {application.proposedAmount}</div>
                    <div>Timeline: {application.proposedDuration}</div>
                  </div>
                  <div className="text-sm leading-7 text-charcoal-700 dark:text-charcoal-300">{application.coverLetter}</div>
                </div>
                <div className="flex flex-wrap gap-2 lg:w-[240px] lg:flex-col">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/company/applications/${application.id}`}>View Details</Link>
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Shortlist
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Interview
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
