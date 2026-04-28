'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Globe, MapPin, Calendar, Users, Award, ShieldCheck, Edit, ExternalLink } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyProfilePage() {
  const { profile, isLoading } = useProfile();
  const p = profile as any;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
          <p className="text-gray-500 mt-1">Manage your company information</p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/company/profile/edit"><Edit className="h-4 w-4 mr-2" />Edit Profile</Link>
        </Button>
      </div>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
        <CardContent className="p-6 -mt-10">
          <div className="w-20 h-20 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-2xl font-bold border-4 border-white dark:border-[#0a0a0a]">
            {(p?.name || 'C').charAt(0)}
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{p?.name || 'Company Name'}</h2>
              <Badge variant="secondary" className="text-[10px]">Verified</Badge>
            </div>
            {p?.bio && <p className="text-gray-600 dark:text-gray-400 mt-2">{p.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">Information</h3>
            <div className="space-y-3 text-sm">
              <InfoRow icon={Building2} label="Industry" value={p?.industry || 'Not specified'} />
              <InfoRow icon={MapPin} label="Location" value={p?.location || 'Not specified'} />
              <InfoRow icon={Globe} label="Website" value={p?.website || 'Not specified'} isLink />
              <InfoRow icon={Calendar} label="Founded" value={p?.foundedYear || 'Not specified'} />
              <InfoRow icon={Users} label="Size" value={p?.companySize || 'Not specified'} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">Stats</h3>
            <div className="space-y-3 text-sm">
              <InfoRow icon={Award} label="Trust Score" value={`${p?.trustScore || 0}%`} />
              <InfoRow icon={ShieldCheck} label="Status" value="Verified" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isLink }: { icon: React.ElementType; label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <span className="text-gray-500 w-20 flex-shrink-0">{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex items-center gap-1">
          {value} <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-gray-900 dark:text-white truncate">{value}</span>
      )}
    </div>
  );
}