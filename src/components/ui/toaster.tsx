'use client';

import React from 'react';
import { useToast } from '@/hooks/useToast';
import { Toaster as ToastToaster } from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();
  
  return <ToastToaster toasts={toasts} />;
}