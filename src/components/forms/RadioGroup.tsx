'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useFormContext } from 'react-hook-form';
import { FormField } from './FormField';
import { Label } from '../ui/lable';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// React Hook Form Integration
interface RadioGroupFieldProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroup>, 'onValueChange'> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

const RadioGroupField = ({
  name,
  label,
  description,
  required,
  options,
  className,
  ...props
}: RadioGroupFieldProps) => {
  const { register, setValue, watch } = useFormContext();
  const value = watch(name);

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <RadioGroup
        value={value}
        onValueChange={(value) => setValue(name, value)}
        className={className}
        {...props}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </FormField>
  );
};

export { RadioGroup, RadioGroupItem, RadioGroupField };
