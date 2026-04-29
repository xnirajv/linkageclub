'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, CheckCircle2, DollarSign, FileText, Flag, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OverviewTabProps {
  project: any;
  onTabChange: (tab: string) => void;
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
}

export function OverviewTab({ project, onTabChange }: OverviewTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="border shadow-sm">
          <div className="p-5 border-b"><h3 className="font-semibold">Project Details</h3></div>
          <CardContent className="p-5 space-y-3 text-sm">
            <InfoRow label="Title" value={project.title} />
            <InfoRow label="Category" value={project.category} />
            <InfoRow label="Budget" value={`${formatCurrency(project.budget?.min || 0)} - ${formatCurrency(project.budget?.max || 0)}`} />
            <InfoRow label="Duration" value={`${project.duration} days`} />
            <InfoRow label="Location" value={project.location?.type === 'remote' ? 'Remote' : project.location?.label || 'N/A'} icon={<MapPin className="h-4 w-4" />} />
            <InfoRow label="Posted" value={new Date(project.createdAt).toLocaleDateString()} icon={<Clock className="h-4 w-4" />} />
            <InfoRow label="Status" value={<Badge variant="secondary">{project.status?.replace('_', ' ')}</Badge>} />
          </CardContent>
        </Card>

        {project.description && (
          <Card className="border shadow-sm">
            <div className="p-5 border-b"><h3 className="font-semibold">Description</h3></div>
            <CardContent className="p-5 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{project.description}</CardContent>
          </Card>
        )}

        {project.skills?.length > 0 && (
          <Card className="border shadow-sm">
            <div className="p-5 border-b"><h3 className="font-semibold">Skills Required</h3></div>
            <CardContent className="p-5"><div className="flex flex-wrap gap-2">{project.skills.map((s: any, i: number) => (<Badge key={i} variant="secondary">{s.name} {s.level && `(${s.level})`}</Badge>))}</div></CardContent>
          </Card>
        )}

        {project.attachments?.length > 0 && (
          <Card className="border shadow-sm">
            <div className="p-5 border-b"><h3 className="font-semibold">Attachments</h3></div>
            <CardContent className="p-5 space-y-2">{project.attachments.map((a: any) => (<div key={a._id} className="flex items-center justify-between"><span className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400" />{a.name}</span><Button size="sm" variant="ghost" asChild><a href={a.url} target="_blank">Download</a></Button></div>))}</CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card className="border shadow-sm">
          <div className="p-5 border-b"><h3 className="font-semibold">Quick Actions</h3></div>
          <CardContent className="p-5 space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => onTabChange('communication')}><MessageSquare className="h-4 w-4 mr-2" />Message Candidate</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onTabChange('milestones')}><CheckCircle2 className="h-4 w-4 mr-2" />Review Milestones</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onTabChange('payments')}><DollarSign className="h-4 w-4 mr-2" />Release Payment</Button>
            <Button variant="outline" className="w-full justify-start"><FileText className="h-4 w-4 mr-2" />View Contract</Button>
            <Button variant="outline" className="w-full justify-start text-red-600"><Flag className="h-4 w-4 mr-2" />Report Issue</Button>
          </CardContent>
        </Card>

        {project.milestones?.length > 0 && (
          <Card className="border shadow-sm">
            <div className="p-5 border-b"><h3 className="font-semibold">Milestone Timeline</h3></div>
            <CardContent className="p-5 space-y-3">
              {project.milestones.map((m: any) => (
                <div key={m._id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${m.status === 'approved' ? 'bg-green-500' : m.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span className={m.status === 'approved' ? 'line-through text-gray-400' : ''}>{m.title}</span>
                  <span className="ml-auto text-gray-400">₹{m.amount?.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border shadow-sm">
          <div className="p-5 border-b"><h3 className="font-semibold">Recent Applications</h3></div>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">{project.applicationsCount || 0} applications received</p>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <Link href={`/dashboard/company/my-projects/${project._id}/applications`}>View All →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 flex items-center gap-2">{icon}{label}</span>
      <span className="font-medium text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  );
}