'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useFormContext } from 'react-hook-form';
import { Label } from '../ui/lable';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'interactive-ring peer h-5 w-5 shrink-0 rounded-md border border-primary-300 bg-card/80 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary-500 data-[state=checked]:bg-primary-500 data-[state=checked]:text-primary-foreground dark:border-white/15 dark:bg-charcoal-900/70',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// React Hook Form Integration
interface CheckboxFieldProps extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'checked' | 'onCheckedChange'> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
}

const CheckboxField = ({
  name,
  label,
  description,
  required,
  className,
  ...props
}: CheckboxFieldProps) => {
  const { register, setValue, watch } = useFormContext();
  const checked = watch(name);

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <div className={cn('flex items-start space-x-3', className)}>
      <Checkbox
        id={name}
        checked={checked}
        onCheckedChange={(checked) => setValue(name, checked)}
        {...props}
      />
      <div className="grid gap-1.5 leading-none">
        {label && (
          <Label
            htmlFor={name}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="ml-1 text-error-500">*</span>}
          </Label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

interface CheckboxGroupProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

const CheckboxGroup = ({
  name,
  label,
  description,
  required,
  options,
  className,
}: CheckboxGroupProps) => {
  const { register, setValue, watch } = useFormContext();
  const values = watch(name) || [];

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  const handleCheckedChange = (value: string, checked: boolean) => {
    const newValues = checked
      ? [...values, value]
      : values.filter((v: string) => v !== value);
    setValue(name, newValues);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {(label || description) && (
        <div>
          {label && (
            <Label>
              {label}
              {required && <span className="ml-1 text-error-500">*</span>}
            </Label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${name}-${option.value}`}
              checked={values.includes(option.value)}
              onCheckedChange={(checked) =>
                handleCheckedChange(option.value, checked as boolean)
              }
            />
            <Label
              htmlFor={`${name}-${option.value}`}
              className="text-sm font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Checkbox, CheckboxField, CheckboxGroup };
