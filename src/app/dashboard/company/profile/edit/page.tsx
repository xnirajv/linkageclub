'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCompanyProfilePage() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', location: '', website: '', industry: '', companySize: '', foundedYear: '' });

  useEffect(() => {
    if (!profile) return;
    const p = profile as any;
    setForm({
      name: p?.name || '', bio: p?.bio || '', location: p?.location || '',
      website: p?.website || '', industry: p?.industry || '',
      companySize: p?.companySize || '', foundedYear: String(p?.foundedYear || ''),
    });
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ ...form, foundedYear: form.foundedYear });
    setSaving(false);
    router.push('/dashboard/company/profile');
  };

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/company/profile"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div><h1 className="text-2xl font-bold">Edit Profile</h1><p className="text-gray-500">Update company information</p></div>
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">Company Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company name" /></div>
          <div><label className="text-sm font-medium mb-1 block">Bio</label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="About the company" rows={3} /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="text-sm font-medium mb-1 block">Location</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" /></div>
            <div><label className="text-sm font-medium mb-1 block">Website</label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" /></div>
            <div><label className="text-sm font-medium mb-1 block">Industry</label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology" /></div>
            <div><label className="text-sm font-medium mb-1 block">Company Size</label><Input value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} placeholder="e.g. 11-50" /></div>
            <div><label className="text-sm font-medium mb-1 block">Founded Year</label><Input value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} placeholder="e.g. 2020" /></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild><Link href="/dashboard/company/profile">Cancel</Link></Button>
        <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}