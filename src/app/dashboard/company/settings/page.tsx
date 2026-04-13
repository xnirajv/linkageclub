'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Building2, KeyRound, Save, Shield, SlidersHorizontal } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/forms/Textarea';

export default function CompanySettingsPage() {
  const { profile, updateProfile, updateSettings, uploadAvatar } = useProfile();
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setCompanyName(profile?.name || '');
    setBio(profile?.bio || '');
    setEmailNotifications(profile?.preferences?.emailNotifications ?? true);
    setPushNotifications(profile?.preferences?.pushNotifications ?? true);
    setNewsletter(profile?.preferences?.newsletter ?? false);
    setTwoFactorAuth(profile?.verification?.phone ?? false);
  }, [profile]);

  return (
    <div className="space-y-6">
      {status && (
        <div className={`rounded-2xl border p-4 text-sm ${status.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Control company account settings, notification preferences, security posture, and shortcut access to billing and team management.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl text-charcoal-950 dark:text-white"><Building2 className="h-5 w-5 text-primary-700" />Account Profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} placeholder="Company description" />
              <div className="flex flex-wrap gap-3">
                <Button onClick={async () => {
                  setStatus(null);
                  try {
                    await updateProfile({ name: companyName.trim(), bio: bio.trim() });
                    setStatus({ type: 'success', message: 'Account profile updated successfully.' });
                  } catch (error) {
                    setStatus({
                      type: 'error',
                      message: error instanceof Error ? error.message : 'Failed to update account profile.',
                    });
                  }
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (file) {
                      try {
                        await uploadAvatar(file);
                        setStatus({ type: 'success', message: 'Logo uploaded successfully.' });
                      } catch (error) {
                        setStatus({
                          type: 'error',
                          message: error instanceof Error ? error.message : 'Failed to upload logo.',
                        });
                      }
                    }
                  };
                  input.click();
                }}>
                  Upload Logo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl text-charcoal-950 dark:text-white"><Bell className="h-5 w-5 text-info-700" />Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Email notifications" value={emailNotifications} onChange={setEmailNotifications} />
              <ToggleRow label="Push notifications" value={pushNotifications} onChange={setPushNotifications} />
              <ToggleRow label="Weekly digest" value={newsletter} onChange={setNewsletter} />
              <Button
                variant="outline"
                onClick={async () => {
                  setStatus(null);
                  try {
                    await updateSettings({
                      emailNotifications,
                      pushNotifications,
                      newsletter,
                    });
                    setStatus({ type: 'success', message: 'Notification preferences saved.' });
                  } catch (error) {
                    setStatus({
                      type: 'error',
                      message: error instanceof Error ? error.message : 'Failed to save notification preferences.',
                    });
                  }
                }}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl text-charcoal-950 dark:text-white"><Shield className="h-5 w-5 text-secondary-700" />Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Enable two-factor authentication" value={twoFactorAuth} onChange={setTwoFactorAuth} />
              <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm text-charcoal-700 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-300">
                <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-charcoal-700" />Password rotation and login alerts are managed from this security panel.</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl text-charcoal-950 dark:text-white"><SlidersHorizontal className="h-5 w-5 text-primary-700" />Quick Links</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <QuickLink href="/dashboard/company/team" label="Open Team Management" />
              <QuickLink href="/dashboard/company/billing" label="Open Billing & Payments" />
              <QuickLink href="/dashboard/company/profile" label="Open Company Profile" />
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="text-xl font-semibold">Company settings now live on the same premium design system.</div>
              <div className="mt-3 text-sm leading-7 text-white/82">This page connects profile updates, notification controls, security toggles, and account shortcuts into one surface.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
      <div className="text-sm font-medium text-charcoal-800 dark:text-charcoal-200">{label}</div>
      <Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 text-sm font-medium text-charcoal-800 transition hover:border-primary-300 dark:border-white/10 dark:bg-charcoal-950/35 dark:text-charcoal-200">
      {label}
    </Link>
  );
}
