'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, Eye, EyeOff, Link2, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/forms/Select';
import { Form, FormActions, FormMessage } from '../forms/Form';
import { CheckboxField } from '../forms/Checkbox';
import { FormFieldGroup, FormField } from '../forms/FormField';
import { TagInput } from '../forms/TagInput';
import { Textarea } from '../forms/Textarea';
import { cn } from '@/lib/utils/cn';

// ✅ UPDATED SCHEMA - matches backend requirements
const mentorSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    currentRole: z.string().min(2, 'Current role is required'),  // ✅ REQUIRED
    currentCompany: z.string().min(2, 'Current company is required'),  // ✅ REQUIRED
    expertise: z.array(z.string()).min(3, 'At least 3 expertise areas required'),  // ✅ REQUIRED
    yearsOfExperience: z.string().min(1, 'Years of experience required'),  // ✅ REQUIRED
    hourlyRate: z.string().min(1, 'Hourly rate required'),  // ✅ REQUIRED
    bio: z.string().min(200, 'Bio must be at least 200 characters').max(500, 'Bio cannot exceed 500 characters'),
    linkedin: z.string().url('Invalid LinkedIn URL'),  // ✅ REQUIRED
    github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
    portfolio: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
    availability: z.string().min(1, 'Availability selection required'),  // ✅ REQUIRED
    termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type MentorFormData = z.infer<typeof mentorSchema>;

interface MentorSignupFormProps {
  onBack: () => void;
}

const expertiseSuggestions = [
  'React.js', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java',
  'System Design', 'Data Structures', 'Algorithms', 'Machine Learning',
  'DevOps', 'AWS', 'Docker', 'Kubernetes', 'Microservices',
  'Frontend Development', 'Backend Development', 'Full Stack',
  'Mobile Development', 'UI/UX Design', 'Product Management',
  'Agile Methodologies', 'Career Coaching', 'Interview Preparation',
  'Leadership', 'Soft Skills',
];

const experienceYears = [
  { value: '0-2', label: '0-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-8', label: '5-8 years' },
  { value: '8-12', label: '8-12 years' },
  { value: '12+', label: '12+ years' },
];

const availabilityOptions = [
  { value: 'weekdays', label: 'Weekdays (9 AM - 6 PM)' },
  { value: 'evenings', label: 'Evenings (6 PM - 10 PM)' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'flexible', label: 'Flexible' },
];

const sectionClassName =
  'rounded-[28px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,236,228,0.62))] p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.35)]';

const iconShellClassName =
  'flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_18px_36px_-20px_rgba(15,23,42,0.28)]';

export function MentorSignupForm({ onBack }: MentorSignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [bioLength, setBioLength] = React.useState(0);

  const form = useForm<MentorFormData>({
    resolver: zodResolver(mentorSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      currentRole: '',
      currentCompany: '',
      expertise: [],
      yearsOfExperience: '',
      hourlyRate: '',
      bio: '',
      linkedin: '',
      github: '',
      portfolio: '',
      availability: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: MentorFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup/mentor', {
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

      {/* Section 1: Account Information */}
      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-primary-600 to-info-600')}>
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Account Information</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Begin with your core details so mentees see a trusted, professional first impression.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="fullName" label="Full Name" required>
            <Input placeholder="Vikram Singh" {...form.register('fullName')} />
          </FormField>

          <FormField name="email" label="Email Address" required>
            <Input type="email" placeholder="vikram@example.com" {...form.register('email')} />
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

      {/* Section 2: Professional Information (All Required Now) */}
      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-secondary-500 to-secondary-700')}>
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Professional Information</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Define your experience, positioning, and expertise so students understand what makes you valuable.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="currentRole" label="Current Role" required>
            <Input placeholder="Senior Engineer" {...form.register('currentRole')} />
          </FormField>

          <FormField name="currentCompany" label="Current Company" required>
            <Input placeholder="Google" {...form.register('currentCompany')} />
          </FormField>
        </FormFieldGroup>

        <FormFieldGroup className="mt-4">
          <SelectField
            name="yearsOfExperience"
            label="Years of Experience"
            options={experienceYears}
            placeholder="Select experience"
            required
          />

          <FormField name="hourlyRate" label="Hourly Rate (Rs)" required>
            <Input type="number" placeholder="1500" {...form.register('hourlyRate')} />
          </FormField>
        </FormFieldGroup>

        <TagInput
          name="expertise"
          label="Areas of Expertise"
          description="Add at least 3 areas of expertise"
          placeholder="Type an area..."
          suggestions={expertiseSuggestions}
          maxTags={10}
          className="mt-4"
        />

        <FormField name="bio" label="Professional Bio" required className="mt-4">
          <div>
            <Textarea
              placeholder="I'm a senior engineer with 8+ years of experience..."
              rows={6}
              {...form.register('bio')}
              onChange={(e) => setBioLength(e.target.value.length)}
              className={bioLength > 500 ? 'border-red-500 focus:ring-red-500' : ''}
            />
            <div className={`text-xs mt-1 flex justify-between ${bioLength > 500 ? 'text-red-500' : bioLength > 450 ? 'text-yellow-500' : 'text-gray-500'
              }`}>
              <span>{bioLength} / 500 characters</span>
              {bioLength > 500 && (
                <span>⚠️ {bioLength - 500} characters over limit</span>
              )}
              {bioLength <= 500 && bioLength > 450 && (
                <span>⚠️ Approaching limit</span>
              )}
            </div>
          </div>
        </FormField>
      </div>

      {/* Section 3: Links & Availability */}
      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-info-500 to-primary-600')}>
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Links & Availability</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Add the links and schedule details that help mentees understand your availability and credibility.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="linkedin" label="LinkedIn Profile" required>
            <Input placeholder="https://linkedin.com/in/vikram" {...form.register('linkedin')} />
          </FormField>

          <FormField name="github" label="GitHub Profile">
            <Input placeholder="https://github.com/vikram" {...form.register('github')} />
          </FormField>
        </FormFieldGroup>

        <FormField name="portfolio" label="Portfolio / Personal Website" className="mt-4">
          <Input placeholder="https://vikram.dev" {...form.register('portfolio')} />
        </FormField>

        <SelectField
          name="availability"
          label="Availability"
          options={availabilityOptions}
          placeholder="When can you mentor?"
          className="mt-4"
          required
        />
      </div>

      {/* Section 4: Consent */}
      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-charcoal-700 to-charcoal-900')}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Consent</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Confirm the final requirement before your mentor profile can move into review.
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
          Apply as Mentor
        </Button>
      </FormActions>
    </Form>
  );
}