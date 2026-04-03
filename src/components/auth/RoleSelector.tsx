'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, GraduationCap, Rocket, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

interface Role {
  id: 'student' | 'company' | 'mentor' | 'founder';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
  features: string[];
}

const roles: Role[] = [
  {
    id: 'student',
    title: 'Student',
    description: 'Learn skills, get verified, work on projects, and get hired',
    icon: GraduationCap,
    color: 'from-primary-600 to-info-600',
    badge: 'Most Popular',
    features: ['Free learning resources', 'Skill assessments & badges', 'Real project work', 'Job placements', 'Mentor guidance'],
  },
  {
    id: 'company',
    title: 'Company',
    description: 'Find pre-verified talent, post projects, and hire full-time',
    icon: Building2,
    color: 'from-secondary-500 to-secondary-700',
    features: ['Pre-verified talent pool', 'Post projects & jobs', 'AI-powered matching', 'Trust score system', 'Bulk hiring tools'],
  },
  {
    id: 'mentor',
    title: 'Mentor',
    description: 'Guide students, share expertise, and earn money',
    icon: Users,
    color: 'from-success-500 to-info-600',
    features: ['Set your own rates', 'Flexible schedule', 'Build reputation', 'Earn meaningful income', 'Create content'],
  },
  {
    id: 'founder',
    title: 'Founder',
    description: 'Find co-founders, build your team, and showcase your startup',
    icon: Rocket,
    color: 'from-warning-500 to-secondary-500',
    features: ['Co-founder matching', 'Team building', 'Startup profile', 'Investor connect', 'Pitch practice'],
  },
];

interface RoleSelectorProps {
  onSelect: (role: Role['id']) => void;
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = React.useState<Role['id'] | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onSelect(selectedRole);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: '4 tailored roles', value: 'Premium paths' },
          { label: 'Short signup', value: 'Essentials only' },
          { label: 'Later edits', value: 'Dashboard profile' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-[22px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,240,233,0.72))] px-4 py-3 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.24)]"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-charcoal-500">{item.label}</div>
            <div className="mt-1 text-sm font-semibold text-charcoal-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <motion.div key={role.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Card
                className={cn(
                  'luxury-border relative cursor-pointer overflow-hidden rounded-[26px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,238,230,0.72))] p-4 shadow-[0_22px_55px_-42px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-44px_rgba(76,95,170,0.28)] dark:border-white/10 dark:bg-charcoal-950/58',
                  isSelected && 'border-primary-200 shadow-[0_34px_80px_-50px_rgba(79,70,229,0.38)] ring-2 ring-primary-500/25 dark:border-primary-700/40'
                )}
                onClick={() => setSelectedRole(role.id)}
              >
                <div
                  className={cn(
                    'absolute right-0 top-0 h-32 w-32 translate-x-16 translate-y-16 rounded-full bg-gradient-to-r opacity-[0.14]',
                    role.color
                  )}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

                {role.badge && (
                  <Badge variant="success" className="absolute right-3 top-3 text-[10px]">
                    {role.badge}
                  </Badge>
                )}

                <div className="relative">
                  <div className={cn('mb-3 inline-flex rounded-[18px] bg-gradient-to-r p-2.5 text-white shadow-[0_18px_36px_-22px_rgba(52,74,134,0.55)]', role.color)}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="mb-1 text-base font-semibold text-charcoal-950 dark:text-white">{role.title}</h3>
                      <p className="mb-2 text-xs leading-5 text-charcoal-600 dark:text-charcoal-400">{role.description}</p>
                    </div>
                    <div
                      className={cn(
                        'mt-0.5 h-3 w-3 rounded-full border transition-all',
                        isSelected ? 'border-primary-600 bg-primary-600 shadow-[0_0_0_4px_rgba(99,102,241,0.14)]' : 'border-charcoal-300 bg-white'
                      )}
                    />
                  </div>

                  <ul className="space-y-1">
                    {role.features.slice(0, 2).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-300" />
                        <span className="text-xs text-charcoal-700 dark:text-charcoal-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
                    Tap to continue
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleContinue} disabled={!selectedRole} className="group min-w-[160px]">
          Continue
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
