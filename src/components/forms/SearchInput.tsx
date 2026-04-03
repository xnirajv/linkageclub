'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Input, InputProps } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps extends InputProps {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  showClear?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    className, 
    onSearch, 
    onClear, 
    debounceMs = 300, 
    showClear = true,
    value: controlledValue,
    onChange,
    ...props 
  }, ref) => {
    const [value, setValue] = React.useState(controlledValue || '');
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    React.useEffect(() => {
      const handler = setTimeout(() => {
        if (onSearch) {
          onSearch(value as string);
        }
      }, debounceMs);

      return () => {
        clearTimeout(handler);
      };
    }, [value, onSearch, debounceMs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange?.(e);
    };

    const handleClear = () => {
      setValue('');
      if (onSearch) {
        onSearch('');
      }
      onClear?.();
    };

    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn('pl-9', showClear && value && 'pr-9')}
          {...props}
        />
        {showClear && value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };