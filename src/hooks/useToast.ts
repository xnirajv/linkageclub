'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

let toastCount = 0;
let listeners: ((toasts: Toast[]) => void)[] = [];

// Global toast store
let globalToasts: Toast[] = [];

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = (++toastCount).toString();
  const newToast = { ...toast, id };
  globalToasts = [...globalToasts, newToast];
  listeners.forEach(listener => listener(globalToasts));
  
  // Auto dismiss
  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 3000);
  
  return id;
};

const removeToast = (id: string) => {
  globalToasts = globalToasts.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener(globalToasts));
};

// React hook
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);
  
  // Subscribe to global toast changes
  useState(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  });
  
  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 3000,
  }: {
    title?: string;
    description?: string;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }) => {
    return addToast({ title, description, variant, duration });
  }, []);
  
  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, []);
  
  const dismissAll = useCallback(() => {
    globalToasts = [];
    listeners.forEach(listener => listener(globalToasts));
  }, []);
  
  return { toast, toasts, dismiss, dismissAll };
}

// Standalone toast function (can be used outside React components)
export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, variant: 'success', duration });
  },
  error: (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, variant: 'error', duration });
  },
  warning: (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, variant: 'warning', duration });
  },
  info: (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, variant: 'info', duration });
  },
  default: (title: string, description?: string, duration?: number) => {
    return addToast({ title, description, variant: 'default', duration });
  },
  dismiss: (id: string) => {
    removeToast(id);
  },
  dismissAll: () => {
    globalToasts = [];
    listeners.forEach(listener => listener(globalToasts));
  },
};