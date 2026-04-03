'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils/cn';
import { AlertCircle } from 'lucide-react';
import { Label } from '../ui/lable';

interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const FormField = ({
  name,
  label,
  description,
  required = false,
  children,
  className,
}: FormFieldProps) => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </Label>
      )}
      
      {children}
      
      {description && !error && (
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{description}</p>
      )}
      
      {error && (
        <div className="flex items-center gap-1 text-sm text-error-600 dark:text-error-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface FormFieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const FormFieldGroup = ({ children, className, ...props }: FormFieldGroupProps) => {
  return (
    <div className={cn('grid gap-4 md:grid-cols-2', className)} {...props}>
      {children}
    </div>
  );
};

export { FormField, FormFieldGroup };