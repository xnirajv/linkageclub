'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils/cn';
import { useFormContext } from 'react-hook-form';
import { FormField } from './FormField';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

// React Hook Form Integration
interface SliderFieldProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  formatLabel?: (value: number) => string;
}

const SliderField = ({
  name,
  label,
  description,
  required,
  formatLabel = (value) => `${value}`,
  className,
  ...props
}: SliderFieldProps) => {
  const { register, setValue, watch } = useFormContext();
  const value = watch(name) || props.defaultValue || [0];

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <div className={cn('space-y-4', className)}>
        {/* Value Display */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-charcoal-500">Selected Value:</span>
          <span className="text-sm font-medium">
            {Array.isArray(value)
              ? value.map((v: number) => formatLabel(v)).join(' - ')
              : formatLabel(value)}
          </span>
        </div>

        {/* Slider */}
        <Slider
          value={Array.isArray(value) ? value : [value]}
          onValueChange={(newValue) => setValue(name, newValue)}
          {...props}
        />
      </div>
    </FormField>
  );
};

interface RangeSliderFieldProps extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'value' | 'onValueChange'> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  min: number;
  max: number;
  step?: number;
  formatLabel?: (value: number) => string;
}

const RangeSliderField = ({
  name,
  label,
  description,
  required,
  min,
  max,
  step = 1,
  formatLabel = (value) => `${value}`,
  className,
  ...props
}: RangeSliderFieldProps) => {
  const { register, setValue, watch } = useFormContext();
  const value = watch(name) || [min, max];

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <div className={cn('space-y-4', className)}>
        {/* Range Display */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-charcoal-500">Selected Range:</span>
          <span className="text-sm font-medium">
            {formatLabel(value[0])} - {formatLabel(value[1])}
          </span>
        </div>

        {/* Slider */}
        <Slider
          value={value}
          onValueChange={(newValue) => setValue(name, newValue)}
          min={min}
          max={max}
          step={step}
          {...props}
        />
      </div>
    </FormField>
  );
};

export { Slider, SliderField, RangeSliderField };
