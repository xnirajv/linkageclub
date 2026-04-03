'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';

export function EmailVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const handleResendVerification = async () => {
    // Implementation for resending verification email
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage('Verification email sent!');
      }
    } catch (error) {
      setMessage('Failed to resend verification email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary-600" />}
          {status === 'success' && <CheckCircle className="h-12 w-12 mx-auto text-success-600" />}
          {status === 'error' && <XCircle className="h-12 w-12 mx-auto text-error-600" />}
          <CardTitle className="mt-4">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Email Verified'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <Button onClick={() => router.push('/login')} className="w-full">
              Continue to Login
            </Button>
          )}
          {status === 'error' && (
            <div className="space-y-3">
              <Button onClick={handleResendVerification} variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </Button>
              <Button onClick={() => router.push('/')} variant="ghost" className="w-full">
                Back to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}