'use client';

import * as React from 'react';
import { useForm, FormProvider, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils/cn';

interface FormProps<T extends FieldValues> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  className?: string;
}

function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  ...props
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}

interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const FormSection = ({ title, description, children, className, ...props }: FormSectionProps) => {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-medium text-charcoal-950 dark:text-white">{title}</h3>}
          {description && <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

const FormActions = ({ children, align = 'right', className, ...props }: FormActionsProps) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={cn('flex items-center gap-3 pt-4', alignClasses[align], className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface FormDividerProps extends React.HTMLAttributes<HTMLHRElement> {
  label?: string;
}

const FormDivider = ({ label, className, ...props }: FormDividerProps) => {
  if (label) {
    return (
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-300 dark:border-charcoal-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-charcoal-500 dark:bg-charcoal-900 dark:text-charcoal-400">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <hr
      className={cn('border-charcoal-300 dark:border-charcoal-600', className)}
      {...props}
    />
  );
};

interface FormMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

const FormMessage = ({ type = 'info', children, className, ...props }: FormMessageProps) => {
  const typeClasses = {
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    success: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  };

  return (
    <div
      className={cn(
        'rounded-md border p-4 text-sm',
        typeClasses[type],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Form, FormSection, FormActions, FormDivider, FormMessage };
export type { FormProps };