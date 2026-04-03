'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PlatformSettings {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  platformFee: number;
  maxProjectBudget: number;
  supportEmail: string;
  platformName: string;
}

interface SettingsFormProps {
  initialSettings?: Partial<PlatformSettings>;
  onSave?: (settings: PlatformSettings) => void;
}

export function SettingsForm({ initialSettings, onSave }: SettingsFormProps) {
  const [settings, setSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    platformFee: 10,
    maxProjectBudget: 1000000,
    supportEmail: '',
    platformName: 'SkillBridge',
    ...initialSettings,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      onSave?.(settings);
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
        <CardHeader><CardTitle>Platform Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Platform Name</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Support Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Platform Fee (%)</label>
            <input
              type="number"
              min={0}
              max={50}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={settings.platformFee}
              onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Access Controls</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {([
            ['maintenanceMode', 'Maintenance Mode', 'Disable platform access for all users'],
            ['allowNewRegistrations', 'Allow New Registrations', 'Allow new users to sign up'],
            ['requireEmailVerification', 'Require Email Verification', 'Users must verify email before accessing platform'],
          ] as const).map(([key, label, description]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Toggle
                checked={settings[key] as boolean}
                onChange={() => setSettings({ ...settings, [key]: !settings[key] })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} isLoading={isSaving}>Save Settings</Button>
    </div>
  );
}
