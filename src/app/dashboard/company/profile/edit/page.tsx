'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';

export default function EditCompanyProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
    github: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    companyType: '',
  });

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      website: profile?.socialLinks?.portfolio || profile?.website || '',
      linkedin: profile?.socialLinks?.linkedin || '',
      twitter: profile?.socialLinks?.twitter || '',
      github: profile?.socialLinks?.github || '',
      industry: profile?.industry || '',
      companySize: profile?.companySize || '',
      foundedYear: `${profile?.foundedYear || ''}`,
      companyType: profile?.companyType || '',
    });
  }, [profile]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: form.name,
        bio: form.bio,
        location: form.location,
        phone: form.phone,
        industry: form.industry,
        companySize: form.companySize,
        foundedYear: form.foundedYear,
        companyType: form.companyType,
        socialLinks: {
          portfolio: form.website,
          linkedin: form.linkedin,
          twitter: form.twitter,
          github: form.github,
        },
      });
      router.push('/dashboard/company/profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Edit Company Profile</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Refine how your company presents itself across candidate discovery, project listings, and company trust surfaces.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Brand & Story</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (file) await uploadAvatar(file);
                };
                input.click();
              }}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Company name" />
              <Textarea rows={6} value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} placeholder="Tell candidates what your company builds and why they should care." />
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Company Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" />
              <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" />
              <Input value={form.industry} onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))} placeholder="Industry" />
              <Input value={form.companySize} onChange={(e) => setForm((prev) => ({ ...prev, companySize: e.target.value }))} placeholder="Company size" />
              <Input value={form.foundedYear} onChange={(e) => setForm((prev) => ({ ...prev, foundedYear: e.target.value }))} placeholder="Founded year" />
              <Input value={form.companyType} onChange={(e) => setForm((prev) => ({ ...prev, companyType: e.target.value }))} placeholder="Company type" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Online Presence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="Website" />
              <Input value={form.linkedin} onChange={(e) => setForm((prev) => ({ ...prev, linkedin: e.target.value }))} placeholder="LinkedIn" />
              <Input value={form.twitter} onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))} placeholder="Twitter" />
              <Input value={form.github} onChange={(e) => setForm((prev) => ({ ...prev, github: e.target.value }))} placeholder="GitHub" />
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-primary-700 via-info-600 to-info-500 text-white">
            <CardContent className="p-6">
              <div className="text-xl font-semibold">This edit flow now matches the premium company profile system.</div>
              <div className="mt-3 text-sm leading-7 text-white/82">Brand inputs, company details, and social identity are grouped into a cleaner profile-edit experience.</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push('/dashboard/company/profile')}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
