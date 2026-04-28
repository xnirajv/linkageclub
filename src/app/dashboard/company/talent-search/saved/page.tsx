'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SavedTalentPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div><h1 className="text-2xl font-bold">Saved Talent</h1><p className="text-gray-500">Candidates you&apos;ve bookmarked</p></div>
      <Card className="border border-dashed border-gray-200 dark:border-gray-800 shadow-none">
        <CardContent className="p-12 text-center">
          <Bookmark className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 mb-4">No saved candidates yet</p>
          <Button asChild size="sm"><Link href="/dashboard/company/talent-search">Browse Talent</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}