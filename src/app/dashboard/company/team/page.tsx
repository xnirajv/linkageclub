'use client';

import { useState } from 'react';
import { Mail, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type TeamInvite = {
  email: string;
  sent: string;
  role?: string;
};

const initialMembers = [
  { id: '1', name: 'Rahul Mehta', role: 'Company Admin', detail: 'Full access', lastActive: 'Today' },
  { id: '2', name: 'Priya Sharma', role: 'Hiring Manager', detail: 'Post jobs, review applications', lastActive: '2 days ago' },
  { id: '3', name: 'Amit Kumar', role: 'Technical Interviewer', detail: 'View applications, conduct interviews', lastActive: '5 days ago' },
];

const initialInvites: TeamInvite[] = [
  { email: 'neha@techcorp.com', sent: '2 days ago' },
  { email: 'raj@techcorp.com', sent: '5 days ago' },
];

export default function CompanyTeamPage() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Hiring Manager');
  const [members, setMembers] = useState(initialMembers);
  const [invites, setInvites] = useState(initialInvites);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sendInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Enter a valid email address to send an invitation.' });
      return;
    }

    if (invites.some((invite) => invite.email === email)) {
      setStatus({ type: 'error', message: 'That teammate already has a pending invitation.' });
      return;
    }

    setInvites((prev) => [{ email, sent: 'Just now', role: inviteRole }, ...prev]);
    setInviteEmail('');
    setStatus({ type: 'success', message: `Invitation sent to ${email}.` });
  };

  return (
    <div className="space-y-6">
      {status && (
        <div className={`rounded-2xl border p-4 text-sm ${status.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

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
        <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
          <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="rounded-2xl border border-white/55 bg-card/72 px-4 py-3 text-sm text-charcoal-900 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-charcoal-900/72 dark:text-white"
          >
            <option>Hiring Manager</option>
            <option>Technical Interviewer</option>
            <option>Recruiter</option>
            <option>Finance Manager</option>
          </select>
          <Button onClick={sendInvite}>
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
                {invite.role ? <div className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">{invite.role}</div> : null}
                <div className="mt-2 text-sm text-charcoal-500 dark:text-charcoal-400">Sent {invite.sent}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => setStatus({ type: 'success', message: `Invitation resent to ${invite.email}.` })}>Resend</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setInvites((prev) => prev.filter((item) => item.email !== invite.email));
                    setStatus({ type: 'success', message: `Invitation for ${invite.email} cancelled.` });
                  }}>Cancel</Button>
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
