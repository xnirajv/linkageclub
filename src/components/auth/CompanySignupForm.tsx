'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Eye, EyeOff, ShieldCheck, MapPin, Calendar, Users, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckboxField } from '@/components/forms/Checkbox';
import { SelectField } from '@/components/forms/Select';
import { Textarea } from '@/components/forms/Textarea';
import { Form, FormActions, FormMessage } from '../forms/Form';
import { FormFieldGroup, FormField } from '../forms/FormField';
import { cn } from '@/lib/utils/cn';

const companySchema = z
  .object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    website: z.string().url('Invalid website URL'),
    industry: z.string().min(1, 'Industry is required'),
    size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+'], {
      required_error: 'Company size is required',
    }),
    location: z.string().min(2, 'Location is required'),
    description: z.string().min(100, 'Description must be at least 100 characters'),
    foundedYear: z.string().min(4, 'Founded year is required'),
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    logo: z.any().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanySignupFormProps {
  onBack: () => void;
}

// Options for selects
const industryOptions = [
  { value: 'technology', label: 'Technology / Software' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'ecommerce', label: 'E-commerce / Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing / Advertising' },
  { value: 'realestate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
];

const sizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const sectionClassName =
  'rounded-[28px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,236,228,0.62))] p-6 shadow-[0_28px_70px_-50px_rgba(15,23,42,0.35)]';

const iconShellClassName =
  'flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_18px_36px_-20px_rgba(15,23,42,0.28)]';

export function CompanySignupForm({ onBack }: CompanySignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: '',
      email: '',
      password: '',
      confirmPassword: '',
      website: '',
      industry: '',
      size: undefined,
      location: '',
      description: '',
      foundedYear: '',
      linkedin: '',
      twitter: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }
        if (key === 'logo') {
          if (value instanceof File) {
            formData.append(key, value);
          }
          return;
        }
        formData.append(key, String(value));
      });

      const response = await fetch('/api/auth/signup/company', {
        method: 'POST',
        body: formData,
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
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-primary-700 to-info-600')}>
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Account Information</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Set up the main company account so your hiring workspace starts with a polished foundation.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="companyName" label="Company Name" required>
            <Input placeholder="TechCorp" {...form.register('companyName')} />
          </FormField>

          <FormField name="email" label="Email Address" required>
            <Input type="email" placeholder="contact@techcorp.com" {...form.register('email')} />
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

      {/* Section 2: Company Details (NEW - All Required Fields) */}
      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div className={cn(iconShellClassName, 'bg-gradient-to-br from-secondary-500 to-secondary-700')}>
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Company Details</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Tell us about your company to help candidates find you.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="website" label="Website" required>
            <Input placeholder="https://www.techcorp.com" {...form.register('website')} />
          </FormField>

          <SelectField name="industry" label="Industry" options={industryOptions} placeholder="Select industry" required />
        </FormFieldGroup>

        <FormFieldGroup className="mt-4">
          <SelectField name="size" label="Company Size" options={sizeOptions} placeholder="Select size" required />

          <FormField name="location" label="Location" required>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-10" placeholder="Bengaluru, India" {...form.register('location')} />
            </div>
          </FormField>
        </FormFieldGroup>

        <FormFieldGroup className="mt-4">
          <FormField name="foundedYear" label="Founded Year" required>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="pl-10" placeholder="2020" {...form.register('foundedYear')} />
            </div>
          </FormField>
        </FormFieldGroup>

        <FormField name="description" label="Company Description" required className="mt-4">
          <Textarea
            placeholder="Tell us about your company mission, products, and culture..."
            rows={5}
            {...form.register('description')}
          />
        </FormField>
      </div>

      {/* Section 3: Social Links */}
      <div className={sectionClassName}>
        <div className="mb-5 flex items-start gap-3">
          <div>
            <h3 className="text-lg font-semibold text-charcoal-950">Social Links (Optional)</h3>
            <p className="mt-1 text-sm leading-6 text-charcoal-600">
              Add your LinkedIn and Twitter to build trust with candidates.
            </p>
          </div>
        </div>

        <FormFieldGroup>
          <FormField name="linkedin" label="LinkedIn URL">
            <Input placeholder="https://linkedin.com/company/techcorp" {...form.register('linkedin')} />
          </FormField>
          <FormField name="twitter" label="Twitter URL">
            <Input placeholder="https://twitter.com/techcorp" {...form.register('twitter')} />
          </FormField>
        </FormFieldGroup>
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
              Review the final requirement before your company workspace goes live.
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
          Create Company Account
        </Button>
      </FormActions>
    </Form>
  );
}
