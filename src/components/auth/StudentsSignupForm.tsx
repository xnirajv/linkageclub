'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, GraduationCap, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormActions, FormMessage } from '../forms/Form';
import { cn } from '@/lib/utils/cn';
import { FormFieldGroup, FormField } from '../forms/FormField';
import { CheckboxField } from '../forms/Checkbox';

const studentSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
    college: z.string().optional().or(z.literal('')),
    graduationYear: z.string().optional().or(z.literal('')),
    degree: z.string().optional().or(z.literal('')),
    yearOfStudy: z.enum(['1st', '2nd', '3rd', '4th', 'graduate']).optional(),
    skills: z.array(z.string()).optional(),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
    termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
    updatesAccepted: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentSignupFormProps {
  onBack: () => void;
}

const sectionClassName =
  'rounded-[28px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,236,228,0.62))] p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.35)]';

const iconShellClassName =
  'flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_18px_36px_-20px_rgba(15,23,42,0.28)]';

export function StudentSignupForm({ onBack }: StudentSignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      college: '',
      graduationYear: '',
      degree: '',
      yearOfStudy: undefined,
      skills: [],
      linkedin: '',
      github: '',
      portfolio: '',
      termsAccepted: false,
      updatesAccepted: false,
    },
  });

  const password = form.watch('password');

  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to create account');
      }

      router.push('/verify-email?email=' + encodeURIComponent(data.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one number', met: /[0-9]/.test(password) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-8">
      {error ? <FormMessage type="error">{error}</FormMessage> : null}

      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-primary-600 to-info-600')}>
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Personal Information</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Start with the essentials so your student profile feels clean, credible, and ready to share.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="fullName" label="Full Name" required>
            <Input placeholder="Riya Sharma" {...form.register('fullName')} />
          </FormField>

          <FormField name="email" label="Email Address" required>
            <Input type="email" placeholder="riya@example.com" {...form.register('email')} />
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

        <div className="mt-5 rounded-[24px] border border-primary-100 bg-white/82 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)]">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-charcoal-900">
            <LockKeyhole className="h-4 w-4 text-primary-600" />
            Password must contain
          </div>
          <ul className="space-y-2">
            {passwordRequirements.map((requirement) => (
              <li
                key={requirement.label}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  requirement.met ? 'text-success-700' : 'text-charcoal-500'
                )}
              >
                <CheckCircle2
                  className={cn('h-4 w-4', requirement.met ? 'text-success-600' : 'text-charcoal-300')}
                />
                <span>{requirement.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={sectionClassName}>
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-charcoal-950">Preferences & Consent</h3>
          <p className="mt-1 text-sm leading-6 text-charcoal-600">
            Only the agreement is needed now. The rest of your profile can be completed later from the dashboard.
          </p>
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
          Create Account
        </Button>
      </FormActions>
    </Form>
  );
}
