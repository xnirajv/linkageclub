'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'check-email'>('check-email');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Case 1: Token hai → verify kar rahe hain (email link se aaya)
  useEffect(() => {
    if (token) {
      setStatus('loading');
      verifyEmail();
    } else if (email) {
      setStatus('check-email');
    } else {
      setStatus('error');
    }
  }, [token, email]);

  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setCanResend(true);
    }
    return;
  }, [countdown, canResend]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      if (response.ok) {
        setStatus('success');
        setTimeout(() => router.push('/login?verified=true'), 2000);
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

  // Case 1: Verifying (token se)
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Verifying your email</h1>
          <p className="text-gray-600">Please wait...</p>
        </Card>
      </div>
    );
  }

  // Case 2: Verification Success
  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-50 p-3">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Email verified!</h1>
          <p className="mb-6 text-gray-600">Redirecting to login...</p>
        </Card>
      </div>
    );
  }

  // Case 3: Token invalid/expired
  if (status === 'error' && token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-50 p-3">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Verification failed</h1>
          <p className="mb-6 text-gray-600">Invalid or expired verification link.</p>
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Case 4: Signup ke baad - "Check your email" page (email param se)
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-blue-50 p-3">
            <Mail className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
        
        <p className="mb-4 text-gray-600">
          We've sent a verification link to
        </p>
        
        <p className="mb-6 font-medium text-gray-900 break-all">
          {email || 'your email address'}
        </p>
        
        <p className="mb-6 text-sm text-gray-500">
          Click the link in the email to verify your account.
        </p>
        
        <div className="space-y-3">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>
          
          {email && (
            <button
              onClick={resendVerification}
              disabled={!canResend}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {canResend ? 'Resend verification email' : `Resend in ${countdown}s`}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}