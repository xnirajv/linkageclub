'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Rocket, ShieldCheck, Users2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/forms/Select';
import { CheckboxField, CheckboxGroup } from '@/components/forms/Checkbox';
import { Form, FormActions, FormMessage } from '../forms/Form';
import { FormFieldGroup, FormField } from '../forms/FormField';
import { Textarea } from '../forms/Textarea';
import { cn } from '@/lib/utils/cn';

const founderSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    startupName: z.string().min(2, 'Startup name is required'),
    startupStage: z.string().optional().or(z.literal('')),
    industry: z.string().optional().or(z.literal('')),
    lookingFor: z.array(z.string()).optional(),
    cofounderRole: z.string().optional(),
    startupDescription: z.string().optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FounderFormData = z.infer<typeof founderSchema>;

interface FounderSignupFormProps {
  onBack: () => void;
}

const startupStages = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'mvp', label: 'Building MVP' },
  { value: 'launched', label: 'Launched' },
  { value: 'early-traction', label: 'Early Traction' },
  { value: 'scaling', label: 'Scaling' },
];

const industries = [
  { value: 'technology', label: 'Technology' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'ai-ml', label: 'AI/ML' },
  { value: 'cleantech', label: 'CleanTech' },
  { value: 'other', label: 'Other' },
];

const lookingForOptions = [
  { value: 'cofounder', label: 'Co-founder' },
  { value: 'tech-team', label: 'Tech Team' },
  { value: 'design-team', label: 'Design Team' },
  { value: 'marketing-team', label: 'Marketing Team' },
  { value: 'advisors', label: 'Advisors' },
  { value: 'investors', label: 'Investors' },
];

const cofounderRoles = [
  { value: 'cto', label: 'CTO / Technical Co-founder' },
  { value: 'cpo', label: 'CPO / Product Co-founder' },
  { value: 'cmo', label: 'CMO / Marketing Co-founder' },
  { value: 'cbo', label: 'CBO / Business Co-founder' },
  { value: 'cdo', label: 'CDO / Design Co-founder' },
];

const sectionClassName =
  'rounded-[28px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,236,228,0.62))] p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.35)]';

const iconShellClassName =
  'flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_18px_36px_-20px_rgba(15,23,42,0.28)]';

export function FounderSignupForm({ onBack }: FounderSignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FounderFormData>({
    resolver: zodResolver(founderSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      startupName: '',
      startupStage: '',
      industry: '',
      lookingFor: [],
      cofounderRole: '',
      startupDescription: '',
      website: '',
      linkedin: '',
      termsAccepted: false,
    },
  });

  const lookingFor = form.watch('lookingFor') ?? [];

  const onSubmit = async (data: FounderFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup/founder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Failed to create account');
      }

      router.push('/verify-email?email=' + encodeURIComponent(data.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-8">
      {error ? <FormMessage type="error">{error}</FormMessage> : null}

      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-primary-600 to-info-600')}>
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Account Information</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Start with your personal details so your founder profile feels trustworthy from the first glance.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="fullName" label="Full Name" required>
            <Input placeholder="Rahul Sharma" {...form.register('fullName')} />
          </FormField>

          <FormField name="email" label="Email Address" required>
            <Input type="email" placeholder="rahul@startup.com" {...form.register('email')} />
          </FormField>
        </FormFieldGroup>

        <FormFieldGroup className="mt-4">
          <FormField name="password" label="Password" required>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter a secure password"
                {...form.register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormField>

          <FormField name="confirmPassword" label="Confirm Password" required>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...form.register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </FormField>
        </FormFieldGroup>
      </div>

      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-secondary-500 to-secondary-700')}>
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Startup Information</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Share the story, stage, and focus of your startup so the right collaborators understand your direction.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="startupName" label="Startup Name" required>
            <Input placeholder="TechStart" {...form.register('startupName')} />
          </FormField>

          <SelectField name="industry" label="Industry" options={industries} placeholder="Select industry" />
        </FormFieldGroup>

        <FormFieldGroup className="mt-4">
          <SelectField
            name="startupStage"
            label="Startup Stage"
            options={startupStages}
            placeholder="Select stage"
          />

          <FormField name="website" label="Website">
            <Input placeholder="https://www.techstart.com" {...form.register('website')} />
          </FormField>
        </FormFieldGroup>

        <FormField
          name="startupDescription"
          label="Startup Description"
          description="Optional for now. You can expand your startup story later from the dashboard."
          className="mt-4"
        >
          <Textarea placeholder="We're building a platform that..." rows={5} {...form.register('startupDescription')} />
        </FormField>
      </div>

      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-info-500 to-primary-600')}>
            <Users2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Team Needs</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Define who you are looking for so InternHub can connect you with the right talent and support.
            </p>
          </div>
        </div>

        <CheckboxGroup
          name="lookingFor"
          label="What are you looking for?"
          description="Optional for now. You can update team needs later from the dashboard."
          options={lookingForOptions}
          className="rounded-[24px] border border-white/60 bg-white/78 p-4"
        />

        {lookingFor.includes('cofounder') ? (
          <SelectField
            name="cofounderRole"
            label="Co-founder Role Needed"
            options={cofounderRoles}
            placeholder="Select role"
            className="mt-4"
          />
        ) : null}

        <FormField name="linkedin" label="LinkedIn Profile" className="mt-4">
          <Input placeholder="https://linkedin.com/in/rahul" {...form.register('linkedin')} />
        </FormField>
      </div>

      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-charcoal-700 to-charcoal-900')}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Consent</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Confirm the terms so your founder profile can move forward without friction.
            </p>
          </div>
        </div>

        <CheckboxField
          name="termsAccepted"
          label="I agree to the Terms of Service and Privacy Policy"
          required
          className="rounded-2xl border border-white/60 bg-white/78 p-4"
        />
      </div>

      <FormActions className="rounded-[28px] border border-white/55 bg-white/82 p-4 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.35)] sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Create Founder Account
        </Button>
      </FormActions>
    </Form>
  );
}
