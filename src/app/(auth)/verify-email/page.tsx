'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
    }
  }, [token]);

  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      setCanResend(true);
    }

    return undefined;
  }, [countdown, canResend]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const resendVerification = async () => {
    if (!canResend || !email) return;

    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setCanResend(false);
      setCountdown(60);
    } catch (error) {
      console.error('Failed to resend:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-charcoal-950">
            Verifying your email
          </h1>
          <p className="text-charcoal-600">
            Please wait while we verify your email address...
          </p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-success-50 p-3">
              <CheckCircle className="h-12 w-12 text-success-500" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-charcoal-950">
            Email verified!
          </h1>
          <p className="mb-6 text-charcoal-600">
            Your email has been successfully verified. You can now access all
            features of InternHub.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-error-50 p-3">
            <AlertCircle className="h-12 w-12 text-error-500" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-charcoal-950">
          Verification failed
        </h1>
        <p className="mb-6 text-charcoal-600">
          {token
            ? 'The verification link is invalid or has expired.'
            : 'No verification token provided.'}
        </p>

        {email && (
          <div className="space-y-4">
            <Button
              onClick={resendVerification}
              disabled={!canResend}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {canResend ? 'Resend verification email' : `Resend in ${countdown}s`}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Back to login</Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
