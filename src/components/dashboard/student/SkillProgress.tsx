'use client';

import React from 'react';
import { Skill } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface SkillProgressProps {
  skills: Skill[];
  onVerify?: (skillName: string) => void;
}

const LEVEL_VALUES: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

const LEVEL_COLORS: Record<string, any> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
  expert: 'default',
};

export function SkillProgress({ skills, onVerify }: SkillProgressProps) {
  const verifiedCount = skills.filter(s => s.verified).length;
  const totalSkills = skills.length;

  if (!skills?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Award className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No skills added yet</p>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <Link href="/dashboard/student/profile/edit">Add Skills</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skills</CardTitle>
          {totalSkills > 0 && (
            <Badge variant="outline" className="text-xs">
              {verifiedCount}/{totalSkills} verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                  {skill.verified ? (
                    <CheckCircle className="h-4 w-4 text-success-600" title="Verified" />
                  ) : (
                    <span className="text-xs text-muted-foreground">(unverified)</span>
                  )}
                </div>
                <Badge variant={LEVEL_COLORS[skill.level]} size="sm" className="capitalize">
                  {skill.level}
                </Badge>
              </div>
              <Progress value={LEVEL_VALUES[skill.level] || 0} className="h-2" />
              {!skill.verified && onVerify && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-1 text-xs"
                  onClick={() => onVerify(skill.name)}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Take assessment to verify
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}