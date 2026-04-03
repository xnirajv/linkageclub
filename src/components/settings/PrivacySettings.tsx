'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private' | 'connections'>('public');
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [allowMessages, setAllowMessages] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-charcoal-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy: { profileVisibility, showEmail, showPhone, allowMessages } }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile Visibility</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(['public', 'connections', 'private'] as const).map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value={opt}
                  checked={profileVisibility === opt}
                  onChange={() => setProfileVisibility(opt)}
                />
                <div>
                  <p className="text-sm font-medium capitalize">{opt}</p>
                  <p className="text-xs text-muted-foreground">
                    {opt === 'public' && 'Anyone can view your profile'}
                    {opt === 'connections' && 'Only your connections can view your profile'}
                    {opt === 'private' && 'Only you can view your profile'}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Email Address</p>
              <p className="text-xs text-muted-foreground">Display your email on your public profile</p>
            </div>
            <Toggle checked={showEmail} onChange={() => setShowEmail(!showEmail)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Phone Number</p>
              <p className="text-xs text-muted-foreground">Display your phone on your public profile</p>
            </div>
            <Toggle checked={showPhone} onChange={() => setShowPhone(!showPhone)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow Direct Messages</p>
              <p className="text-xs text-muted-foreground">Let other users message you directly</p>
            </div>
            <Toggle checked={allowMessages} onChange={() => setAllowMessages(!allowMessages)} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} isLoading={isSaving}>Save Privacy Settings</Button>
    </div>
  );
}
