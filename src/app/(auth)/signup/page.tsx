'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, GraduationCap, Rocket, Users } from 'lucide-react';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { StudentSignupForm } from '@/components/auth/StudentsSignupForm';
import { CompanySignupForm } from '@/components/auth/CompanySignupForm';
import { MentorSignupForm } from '@/components/auth/MentorSignupForm';
import { FounderSignupForm } from '@/components/auth/FounderSignupForm';
import { Card, CardContent } from '@/components/ui/card';

type UserRole = 'student' | 'company' | 'mentor' | 'founder' | null;

const roleMeta: Record<Exclude<UserRole, null>, { label: string; title: string; copy: string; icon: typeof GraduationCap }> = {
  student: {
    label: 'Student Flow',
    title: 'Launch your profile with verified skills and stronger opportunities.',
    copy: 'Set up your academic identity, showcase skills, and enter the hiring pipeline with a polished profile from day one.',
    icon: GraduationCap,
  },
  company: {
    label: 'Company Flow',
    title: 'Build a hiring workspace that feels premium from the first click.',
    copy: 'Create your company presence, define hiring needs, and unlock a cleaner path to trusted candidate discovery.',
    icon: Building2,
  },
  mentor: {
    label: 'Mentor Flow',
    title: 'Turn expertise into a high-trust mentoring presence.',
    copy: 'Present your experience, define availability, and create a premium first impression for students and founders.',
    icon: Users,
  },
  founder: {
    label: 'Founder Flow',
    title: 'Showcase your startup and attract the right collaborators.',
    copy: 'Shape your startup story, team needs, and operator brand in a way that feels focused and credible.',
    icon: Rocket,
  },
};

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [step, setStep] = useState(1);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setStep(1);
  };

  const renderForm = () => {
    switch (selectedRole) {
      case 'student':
        return <StudentSignupForm onBack={handleBack} />;
      case 'company':
        return <CompanySignupForm onBack={handleBack} />;
      case 'mentor':
        return <MentorSignupForm onBack={handleBack} />;
      case 'founder':
        return <FounderSignupForm onBack={handleBack} />;
      default:
        return null;
    }
  };

  const selectedRoleMeta = selectedRole ? roleMeta[selectedRole] : null;

  return (
    <div className="premium-shell relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_24%)]" />
      <div className="container-custom relative flex min-h-screen items-center justify-center py-6 lg:py-10">
        <Card className="luxury-border w-full max-w-[1180px] overflow-hidden border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,246,241,0.9))] shadow-[0_50px_140px_-60px_rgba(76,95,170,0.45)] backdrop-blur-xl dark:bg-charcoal-900/78">
          <CardContent className="flex flex-col p-5 lg:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-700 via-primary-600 to-info-600 text-sm font-bold text-white shadow-[0_24px_45px_-25px_rgba(79,70,229,0.6)]">
                  IH
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.28em] text-charcoal-900 dark:text-white">
                    InternHub
                  </div>
                  <div className="text-sm text-charcoal-500 dark:text-charcoal-400">Premium talent ecosystem</div>
                </div>
              </Link>
              <div className="hidden items-center gap-2 rounded-full border border-white/60 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-700 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.24)] sm:inline-flex">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500" />
                Fast onboarding
              </div>
            </div>

            <div className="rounded-[30px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(242,237,230,0.82))] p-5 shadow-[0_30px_90px_-52px_rgba(15,23,42,0.34)] dark:border-white/10 dark:bg-charcoal-950/48">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal-500 dark:text-charcoal-400">
                    <span className="rounded-full border border-secondary-200/70 bg-secondary-50/90 px-3 py-1 font-semibold text-secondary-800 dark:border-secondary-800/40 dark:bg-secondary-900/20 dark:text-secondary-200">
                      Step {step} of 2
                    </span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{step === 1 ? 'Choose your role' : 'Complete your details'}</span>
                  </div>

                  <h2 className="mt-4 text-[2.15rem] font-semibold leading-none tracking-[-0.05em] text-charcoal-900 dark:text-white lg:text-[2.55rem]">
                    {step === 1 ? 'Create your account' : 'Complete your details'}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[15px] leading-7 text-charcoal-600 dark:text-charcoal-300">
                    {step === 1
                      ? 'Choose your role and move through a short, polished signup designed to get you in fast.'
                      : selectedRoleMeta?.copy || 'Finish the essentials now and complete the rest later from your dashboard.'}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/60 bg-white/72 p-4 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.26)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-charcoal-500">Onboarding</div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-charcoal-100 dark:bg-charcoal-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 via-info-500 to-secondary-500 transition-all duration-500"
                      style={{ width: step === 1 ? '50%' : '100%' }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-charcoal-900">{step === 1 ? 'Role selection' : 'Account setup'}</span>
                    {selectedRoleMeta ? (
                      <span className="rounded-full border border-primary-100 bg-primary-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">
                        {selectedRoleMeta.label}
                      </span>
                    ) : (
                      <span className="text-charcoal-500">2 minute flow</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {step === 1 ? <RoleSelector onSelect={handleRoleSelect} /> : renderForm()}
            </div>

            {step === 1 && (
              <p className="mt-4 text-center text-sm text-charcoal-600 dark:text-charcoal-300">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary-700 transition hover:text-info-700 dark:text-info-300">
                  Sign in
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
