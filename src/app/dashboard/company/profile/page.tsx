'use client';

import Link from 'next/link';
import { Award, Building2, Calendar, Edit, Globe, Mail, MapPin, Share2, ShieldCheck, Users } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompanyProfilePage() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return <div className="rounded-[28px] bg-card/80 p-8 text-sm text-charcoal-500 dark:bg-charcoal-900/72 dark:text-charcoal-400">Loading company profile...</div>;
  }

  const companyName = profile?.name || 'TechCorp Solutions';
  const companyBio = profile?.bio || 'Building innovative digital products, platform experiences, and premium hiring outcomes for fast-growing companies.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Company Profile</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Manage how your brand, verification, and company story appear across projects, jobs, and candidate discovery.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share Profile
          </Button>
          <Button asChild>
            <Link href="/dashboard/company/profile/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.35),_transparent_35%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.95)_60%,_rgba(75,73,69,0.95))] text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-card/12 text-2xl font-semibold">{companyName.slice(0, 1)}</div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-card/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Company
                </div>
                <h2 className="mt-4 text-3xl font-semibold">{companyName}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82">{companyBio}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Projects', '12'],
                ['Team', profile?.companySize || '11-50'],
                ['Trust', `${profile?.trustScore || 92}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[20px] bg-black/10 px-4 py-3 text-center">
                  <div className="text-lg font-semibold">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/68">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Basic Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Info label="Website" value={profile?.website || 'https://techcorp.com'} icon={<Globe className="h-4 w-4 text-info-700" />} />
              <Info label="Email" value={profile?.email || 'hello@techcorp.com'} icon={<Mail className="h-4 w-4 text-primary-700" />} />
              <Info label="Headquarters" value={profile?.location || 'Bangalore, India'} icon={<MapPin className="h-4 w-4 text-secondary-700" />} />
              <Info label="Founded" value={`${profile?.foundedYear || 2022}`} icon={<Calendar className="h-4 w-4 text-charcoal-700" />} />
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">About The Company</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-charcoal-700 dark:text-charcoal-300">
              {companyBio}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Company Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Info label="Active Projects" value="3" icon={<Building2 className="h-4 w-4 text-primary-700" />} />
              <Info label="Team Size" value={profile?.companySize || '11-50 employees'} icon={<Users className="h-4 w-4 text-info-700" />} />
              <Info label="Average Rating" value={`${profile?.stats?.averageRating?.toFixed?.(1) || '4.8'}`} icon={<Award className="h-4 w-4 text-secondary-700" />} />
              <Info label="Trust Score" value={`${profile?.trustScore || 92}%`} icon={<ShieldCheck className="h-4 w-4 text-charcoal-700" />} />
            </CardContent>
          </Card>

          <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
            <CardHeader><CardTitle className="text-xl text-charcoal-950 dark:text-white">Verification</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-charcoal-700 dark:text-charcoal-300">
              <div className="rounded-[20px] border border-primary-100/70 bg-silver-50/70 p-4">Email Verified</div>
              <div className="rounded-[20px] border border-primary-100/70 bg-silver-50/70 p-4">Phone Verified</div>
              <div className="rounded-[20px] border border-primary-100/70 bg-silver-50/70 p-4">Company Verified</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{icon}{label}</div>
      <div className="mt-3 text-sm font-medium text-charcoal-950 dark:text-white">{value}</div>
    </div>
  );
}
