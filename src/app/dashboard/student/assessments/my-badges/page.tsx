'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Award, Star, Trophy, Medal, Zap, Shield, Crown, TrendingUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { BadgeDisplay } from '@/components/assessments/BadgeDisplay';

export default function MyBadgesPage() {
  const { badges, skills, trustScore, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const verifiedSkills = skills?.filter((s: any) => s.verified) || [];
  const totalBadges = badges?.length || 0;
  const totalVerifiedSkills = verifiedSkills.length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My Badges</h1>
        <p className="text-gray-500">Badges and verified skills you've earned</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalBadges}</p>
          <p className="text-sm text-gray-500">Badges Earned</p>
        </Card>
        <Card className="p-4 text-center">
          <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalVerifiedSkills}</p>
          <p className="text-sm text-gray-500">Verified Skills</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{trustScore || 0}</p>
          <p className="text-sm text-gray-500">Trust Score</p>
        </Card>
      </div>

      {/* Badges Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">🏆 Earned Badges</h2>
        <BadgeDisplay badges={badges || []} size="lg" />
      </div>

      {/* Verified Skills Section */}
      {verifiedSkills.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">✅ Verified Skills</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {verifiedSkills.map((skill: any, idx: number) => (
              <Card key={idx} className="p-3 text-center">
                <p className="font-medium">{skill.name}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">{skill.level}</p>
                {skill.verifiedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Verified {new Date(skill.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalBadges === 0 && totalVerifiedSkills === 0 && (
        <Card className="p-12 text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No badges yet</h3>
          <p className="text-gray-500">Complete skill assessments to earn badges and verify your skills</p>
        </Card>
      )}
    </div>
  );
}