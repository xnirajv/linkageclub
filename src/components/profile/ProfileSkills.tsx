import React from 'react';
import { Skill } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProfileSkillsProps {
  skills: Skill[];
}

const levelColors = {
  beginner: 'bg-blue-100 text-blue-700',
  intermediate: 'bg-green-100 text-green-700',
  advanced: 'bg-orange-100 text-orange-700',
  expert: 'bg-purple-100 text-purple-700',
};

export function ProfileSkills({ skills }: ProfileSkillsProps) {
  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No skills added yet
      </div>
    );
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.level]) {
      acc[skill.level] = [];
    }
    acc[skill.level].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedSkills).map(([level, levelSkills]) => (
        <div key={level}>
          <h3 className="text-lg font-semibold mb-3 capitalize">{level}</h3>
          <div className="flex flex-wrap gap-2">
            {levelSkills.map((skill) => (
              <div
                key={skill.name}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm',
                  levelColors[skill.level as keyof typeof levelColors]
                )}
              >
                <span>{skill.name}</span>
                {skill.verified && (
                  <CheckCircle className="h-3 w-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}