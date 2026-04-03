'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg animate-slideIn">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">We use cookies</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to improve your experience on our site. By using our site, you agree to our{' '}
                <Link href="/legal/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDecline} size="sm">
              Decline
            </Button>
            <Button onClick={handleAccept} size="sm">
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}