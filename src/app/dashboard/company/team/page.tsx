'use client';

import { useState } from 'react';
import { Mail, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const members = [
  { id: '1', name: 'Rahul Mehta', role: 'Company Admin', detail: 'Full access', lastActive: 'Today' },
  { id: '2', name: 'Priya Sharma', role: 'Hiring Manager', detail: 'Post jobs, review applications', lastActive: '2 days ago' },
  { id: '3', name: 'Amit Kumar', role: 'Technical Interviewer', detail: 'View applications, conduct interviews', lastActive: '5 days ago' },
];

const invites = [
  { email: 'neha@techcorp.com', sent: '2 days ago' },
  { email: 'raj@techcorp.com', sent: '5 days ago' },
];

export default function CompanyTeamPage() {
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Team Management</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Invite and manage company collaborators who help post roles, review candidates, and coordinate hiring workflows.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Team Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Total Members', '5'],
          ['Active', '3'],
          ['Pending', '2'],
          ['Admins', '1'],
        ].map(([label, value]) => (
          <Card key={label} className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardContent className="p-5">
              <div className="text-sm uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{label}</div>
              <div className="mt-3 text-3xl font-semibold text-charcoal-950 dark:text-white">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
        <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Invite Team Member</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4 lg:flex-row">
          <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
          <Button onClick={() => {
            if (!inviteEmail.trim()) return;
            setInviteEmail('');
            window.alert('Invitation flow placeholder: invite sent.');
          }}>
            <Mail className="mr-2 h-4 w-4" />
            Send Invitation
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Team Members</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-charcoal-950 dark:text-white">{member.name}</div>
                    <div className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">{member.role}</div>
                    <div className="mt-2 text-sm text-charcoal-700 dark:text-charcoal-300">{member.detail}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">Last active: {member.lastActive}</div>
                  </div>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
          <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Pending Invitations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.email} className="rounded-[24px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
                <div className="font-medium text-charcoal-950 dark:text-white">{invite.email}</div>
                <div className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">Sent {invite.sent}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm">Resend</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                </div>
              </div>
            ))}
            <div className="rounded-[24px] border border-secondary-200 bg-secondary-50/80 p-4 text-sm text-charcoal-700 dark:border-secondary-800/30 dark:bg-secondary-950/10 dark:text-charcoal-300">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary-700" />Team roles are aligned with company hiring permissions.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
