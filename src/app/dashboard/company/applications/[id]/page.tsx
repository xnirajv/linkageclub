'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Download, Mail, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState('');

  const candidate = {
    name: 'Riya Sharma',
    email: 'riya.sharma@example.com',
    trustScore: 92,
    role: 'Full Stack Developer',
    location: 'Mumbai, India',
    availability: 'Immediate',
    budget: 'Rs55,000',
    timeline: '28 days',
    coverLetter:
      'I bring strong React, Node.js, and product delivery experience from previous e-commerce and dashboard builds. I can deliver this scope within the proposed timeline while maintaining responsive quality and clean architecture.',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Application Detail</h1>
            <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Review candidate profile, proposal fit, communication, and next-step actions from one premium application workspace.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button>Shortlist</Button>
          <Button variant="outline">Reject</Button>
          <Button variant="outline">Schedule Interview</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Trust Score" value={`${candidate.trustScore}%`} />
        <Metric title="Availability" value={candidate.availability} />
        <Metric title="Proposed" value={candidate.budget} />
        <Metric title="Timeline" value={candidate.timeline} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Candidate Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className="font-semibold text-charcoal-950 dark:text-white">{candidate.name}</div>
                <div className="mt-1 text-charcoal-500 dark:text-charcoal-400">{candidate.role}</div>
                <div className="mt-3">{candidate.email}</div>
                <div className="mt-1">{candidate.location}</div>
                <div className="mt-3 flex items-center gap-2"><Star className="h-4 w-4 text-secondary-600" />High-fit trust and delivery profile</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Cover Letter</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-charcoal-700 dark:text-charcoal-300">{candidate.coverLetter}</CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Communication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-300">
                Candidate conversation is aligned with the new company workflow. Use the quick reply area below to keep the hiring thread moving.
              </div>
              <div className="flex gap-3">
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." />
                <Button onClick={() => setMessage('')}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">AI Insight Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                Strengths: React expertise, relevant delivery history, within budget, high trust score.
              </div>
              <div className="rounded-[22px] border border-secondary-200 bg-secondary-50/80 p-4 dark:border-secondary-800/30 dark:bg-secondary-950/10">
                Consideration: First project with this company, so early communication quality matters.
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">Shortlist Candidate</Button>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Email Candidate
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={typeof params.id === 'string' ? `/dashboard/company/applications` : '/dashboard/company/applications'}>Back to Applications</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-white/70"><ShieldCheck className="h-4 w-4" />Application Workspace</div>
              <div className="mt-4 text-xl font-semibold">This detail page now stays visually aligned with the premium company dashboard.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
      <CardContent className="p-5">
        <div className="text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{title}</div>
        <div className="mt-3 text-2xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
      </CardContent>
    </Card>
  );
}
