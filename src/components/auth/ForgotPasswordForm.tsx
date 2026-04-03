'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
  onBack?: () => void;
  className?: string;
}

export function ForgotPasswordForm({ 
  onSubmit, 
  onBack, 
  className 
}: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (onSubmit) {
        await onSubmit(data.email);
      } else {
        // Default implementation
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send reset email');
        }
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!submittedEmail) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submittedEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`text-center ${className}`}>
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-charcoal-950 mb-2">Check your email</h2>
        <p className="text-charcoal-600 mb-6">
          We've sent a password reset link to <strong>{submittedEmail}</strong>
        </p>

        <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Next steps:</h3>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Open the email from InternHub</li>
            <li>Click the password reset link</li>
            <li>Enter your new password</li>
            <li>Log in with your new password</li>
          </ol>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full"
            isLoading={isLoading}
          >
            Resend email
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </div>

        <p className="text-xs text-charcoal-500 mt-4">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={handleResendEmail}
            className="text-primary-600 hover:underline"
          >
            try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-charcoal-950 mb-2">Forgot password?</h1>
        <p className="text-charcoal-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-charcoal-400" />
            </div>
            <Input
              {...register('email')}
              type="email"
              className="pl-10"
              placeholder="you@example.com"
              error={errors.email?.message}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Send reset link
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Back to login
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-charcoal-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

// Compact version for modals
interface CompactForgotPasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CompactForgotPasswordForm({ onSuccess, onCancel }: CompactForgotPasswordFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (email: string) => {
    // API call here
    setIsSubmitted(true);
    if (onSuccess) onSuccess();
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-medium mb-1">Check your email</h3>
        <p className="text-sm text-charcoal-500 mb-4">
          We've sent you a password reset link
        </p>
        <Button onClick={onCancel} variant="outline" size="sm" className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-charcoal-600 mb-4">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <ForgotPasswordForm onSubmit={handleSubmit} />
      <div className="mt-3 text-center">
        <button
          onClick={onCancel}
          className="text-sm text-charcoal-500 hover:text-charcoal-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
