'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useFormContext } from 'react-hook-form';
import { FormField } from './FormField';

interface DatePickerProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
}

const DatePicker = ({
  name,
  label,
  description,
  required,
  placeholder = 'Select date',
  disabled,
  fromDate,
  toDate,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const { register, setValue, watch } = useFormContext();
  const date = watch(name);

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setValue(name, date);
              setOpen(false);
            }}
            disabled={(date) => {
              if (fromDate && date < fromDate) return true;
              if (toDate && date > toDate) return true;
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormField>
  );
};

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DateRangePicker = ({
  name,
  label,
  description,
  required,
  placeholder = 'Select date range',
  disabled,
  className,
}: DateRangePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const { register, setValue, watch } = useFormContext();
  const dateRange = watch(name) as DateRange | undefined;

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) => {
              setValue(name, range);
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FormField>
  );
};

export { DatePicker, DateRangePicker };
