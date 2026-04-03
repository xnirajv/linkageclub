'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token?: string;
  onSubmit?: (password: string, token?: string) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showLoginLink?: boolean;
}

export function ResetPasswordForm({
  token: propToken,
  onSubmit,
  onSuccess,
  onError,
  className,
  showLoginLink = true,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(propToken || null);

  useEffect(() => {
    // Try to get token from URL if not provided as prop
    if (!token && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        setToken(urlToken);
      }
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password', '');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
    { label: 'At least one number', met: /[0-9]/.test(password) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const passwordStrength = passwordRequirements.filter(req => req.met).length * 20;
  const getStrengthColor = () => {
    if (passwordStrength <= 40) return 'bg-red-500';
    if (passwordStrength <= 60) return 'bg-yellow-500';
    if (passwordStrength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or missing reset token');
      onError?.('Invalid or missing reset token');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (onSubmit) {
        await onSubmit(data.password, token);
      } else {
        // Default implementation
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            password: data.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to reset password');
        }
      }

      setIsSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      onError?.(err instanceof Error ? err.message : 'An error occurred');
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

        <h2 className="text-2xl font-bold text-charcoal-950 mb-2">Password reset successful!</h2>
        <p className="text-charcoal-600 mb-6">
          Your password has been successfully reset. You can now log in with your new password.
        </p>

        <Button asChild className="w-full">
          <Link href="/login">Go to login</Link>
        </Button>

        {showLoginLink && (
          <p className="mt-4 text-sm text-charcoal-600">
            Didn't mean to reset?{' '}
            <Link href="/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    );
  }

  if (!token) {
    return (
      <div className={`text-center ${className}`}>
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-charcoal-950 mb-2">Invalid reset link</h2>
        <p className="text-charcoal-600 mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>

        <Button asChild className="w-full">
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-charcoal-950 mb-2">Set new password</h1>
        <p className="text-charcoal-600">
          Please enter your new password below.
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
          <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-1">
            New password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-charcoal-400" />
            </div>
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="pl-10 pr-10"
              placeholder="••••••••"
              error={errors.password?.message}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-charcoal-400" />
              ) : (
                <Eye className="h-5 w-5 text-charcoal-400" />
              )}
            </button>
          </div>

          {/* Password strength indicator */}
          {password && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-600">Password strength</span>
                <span className="font-medium">
                  {passwordStrength <= 40 ? 'Weak' :
                   passwordStrength <= 60 ? 'Fair' :
                   passwordStrength <= 80 ? 'Good' : 'Strong'}
                </span>
              </div>
              <Progress value={passwordStrength} className="h-1" indicatorClassName={getStrengthColor()} />
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {req.met ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-charcoal-300" />
                    )}
                    <span className={req.met ? 'text-green-600' : 'text-charcoal-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal-700 mb-1">
            Confirm new password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-charcoal-400" />
            </div>
            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="pl-10 pr-10"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-charcoal-400" />
              ) : (
                <Eye className="h-5 w-5 text-charcoal-400" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Reset password
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

// Compact version for modals
interface CompactResetPasswordFormProps {
  token?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CompactResetPasswordForm({ token, onSuccess, onCancel }: CompactResetPasswordFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    // API call here
    setIsSubmitted(true);
    if (onSuccess) onSuccess();
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-medium mb-1">Password reset successful!</h3>
        <p className="text-sm text-charcoal-500 mb-4">
          You can now log in with your new password
        </p>
        <Button onClick={onCancel} variant="outline" size="sm" className="w-full">
          Done
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ResetPasswordForm
        token={token}
        onSubmit={handleSubmit}
        showLoginLink={false}
      />
      {onCancel && (
        <div className="mt-3 text-center">
          <button
            onClick={onCancel}
            className="text-sm text-charcoal-500 hover:text-charcoal-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
