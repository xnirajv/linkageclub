'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjectDetails } from '@/hooks/useProjectDetails';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { ProjectTabs } from '@/components/projects/ProjectTabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { OverviewTab } from '@/components/projects/OverviewTab';
import { MilestonesTab } from '@/components/projects/MilestonesTab';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading, isError, refetch } = useProjectDetails(projectId);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <Card className="border shadow-sm p-12 text-center">
        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
        <p className="text-gray-500 mb-4">This project doesn&apos;t exist or you don&apos;t have access.</p>
        <Button asChild variant="outline"><Link href="/dashboard/company/my-projects">← Back to My Projects</Link></Button>
      </Card>
    );
  }

  const badges = {
    milestones: project.milestones?.filter((m: any) => m.status === 'submitted' || m.status === 'completed').length || 0,
  };

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} badges={badges} />

      <div className="min-h-[500px]">
        {activeTab === 'overview' && <OverviewTab project={project} onTabChange={setActiveTab} />}
        {activeTab === 'milestones' && <MilestonesTab project={project} refetch={refetch} />}
        {activeTab === 'candidate' && <CandidateTab project={project} />}
        {activeTab === 'communication' && <CommunicationTab project={project} />}
        {activeTab === 'payments' && <PaymentsTab project={project} />}
      </div>
    </div>
  );
}

function CandidateTab({ project }: { project: any }) {
  const c = project?.candidate;
  if (!c) return <Card className="border shadow-sm p-12 text-center"><p className="text-gray-500">No candidate hired yet</p></Card>;
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <div className="p-6 flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">{c.name?.[0]}</div>
          <div>
            <h2 className="text-xl font-bold">{c.name}</h2>
            <p className="text-sm text-gray-500">Trust Score: {c.trustScore}% • {c.location}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm">View Profile</Button>
              <Button size="sm" variant="outline">Message</Button>
              <Button size="sm" variant="outline">Rate</Button>
            </div>
          </div>
        </div>
      </Card>
      {c.skills?.length > 0 && (
        <Card className="border shadow-sm"><div className="p-5 border-b"><h3 className="font-semibold">Skills</h3></div><div className="p-5 flex flex-wrap gap-2">{c.skills.map((s: string) => (<span key={s} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{s}</span>))}</div></Card>
      )}
    </div>
  );
}

function CommunicationTab({ project }: { project: any }) {
  return (
    <Card className="border shadow-sm">
      <div className="p-5 border-b"><h3 className="font-semibold">Communication</h3></div>
      <div className="p-5 space-y-4">
        <div className="h-80 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Chat integration coming soon</p>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Type message..." className="flex-1 rounded-xl border px-4 py-2 text-sm" />
          <Button size="sm">Send</Button>
        </div>
      </div>
    </Card>
  );
}

function PaymentsTab({ project }: { project: any }) {
  const ps = project?.paymentSummary || {};
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border shadow-sm">
        <div className="p-5 border-b"><h3 className="font-semibold">Payment Summary</h3></div>
        <div className="p-5 space-y-3 text-sm">
          <InfoRow label="Total Budget" value={`₹${(ps.totalBudget || 0).toLocaleString()}`} />
          <InfoRow label="Released" value={<span className="text-green-600">₹{(ps.released || 0).toLocaleString()}</span>} />
          <InfoRow label="Pending" value={<span className="text-yellow-600">₹{((ps.totalBudget || 0) - (ps.released || 0)).toLocaleString()}</span>} />
          <InfoRow label="Platform Fee (10%)" value={`₹${(ps.platformFee || 0).toLocaleString()}`} />
        </div>
      </Card>
      <Card className="border shadow-sm">
        <div className="p-5 border-b"><h3 className="font-semibold">Transactions</h3></div>
        <div className="p-5">
          {ps.transactions?.length > 0 ? ps.transactions.map((txn: any) => (
            <div key={txn._id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <div><p className="font-medium">{txn.milestone || txn.type}</p><p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</p></div>
              <span className="font-medium">₹{txn.amount?.toLocaleString()}</span>
            </div>
          )) : <p className="text-gray-500 text-sm">No transactions yet</p>}
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return <div className="flex justify-between"><span className="text-gray-500">{label}</span><span className="font-medium">{value}</span></div>;
}