'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface NotificationOption {
  key: string;
  label: string;
  description: string;
}

const EMAIL_OPTIONS: NotificationOption[] = [
  { key: 'jobAlerts', label: 'Job Alerts', description: 'New job matches based on your profile' },
  { key: 'applicationUpdates', label: 'Application Updates', description: 'Status changes on your applications' },
  { key: 'sessionReminders', label: 'Session Reminders', description: 'Upcoming mentor session reminders' },
  { key: 'communityDigest', label: 'Community Digest', description: 'Weekly summary of community activity' },
  { key: 'newsletter', label: 'Newsletter', description: 'Platform updates and tips' },
];

const PUSH_OPTIONS: NotificationOption[] = [
  { key: 'messages', label: 'Messages', description: 'New messages from other users' },
  { key: 'likes', label: 'Likes', description: 'When someone likes your posts' },
  { key: 'comments', label: 'Comments', description: 'When someone comments on your posts' },
];

export function NotificationSettings() {
  const { user } = useAuth();
  const [emailPrefs, setEmailPrefs] = useState<Record<string, boolean>>({
    jobAlerts: user?.preferences?.emailNotifications ?? true,
    applicationUpdates: true,
    sessionReminders: true,
    communityDigest: false,
    newsletter: user?.preferences?.newsletter ?? false,
  });
  const [pushPrefs, setPushPrefs] = useState<Record<string, boolean>>({
    messages: user?.preferences?.pushNotifications ?? true,
    likes: false,
    comments: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailPrefs, pushPrefs }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-charcoal-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {EMAIL_OPTIONS.map((opt) => (
            <div key={opt.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <Toggle
                checked={emailPrefs[opt.key] ?? false}
                onChange={() => setEmailPrefs((p) => ({ ...p, [opt.key]: !p[opt.key] }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Push Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {PUSH_OPTIONS.map((opt) => (
            <div key={opt.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <Toggle
                checked={pushPrefs[opt.key] ?? false}
                onChange={() => setPushPrefs((p) => ({ ...p, [opt.key]: !p[opt.key] }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} isLoading={isSaving}>Save Preferences</Button>
    </div>
  );
}
