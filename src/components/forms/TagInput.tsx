// components/forms/SimpleTagInput.tsx
'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Label } from '../ui/lable';
import { cn } from '@/lib/utils/cn';

interface SimpleTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  maxTags?: number;
}

export function SimpleTagInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  suggestions = [],
  maxTags = 10,
}: SimpleTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (suggestion) => !value.includes(suggestion) && suggestion.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex min-h-[52px] flex-wrap gap-2 rounded-[24px] border border-white/55 bg-card/76 p-3 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.24)]">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 rounded-full px-3 py-1">
            {tag}
            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[140px] flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 ? (
        <div className="rounded-[24px] border border-white/55 bg-white/92 p-3 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.25)]">
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer rounded-full hover:bg-secondary"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div className="text-xs text-charcoal-500">
        {value.length}/{maxTags} tags - press Enter to add
      </div>
    </div>
  );
}

interface TagInputProps extends Omit<SimpleTagInputProps, 'value' | 'onChange'> {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export function TagInput({
  name,
  label,
  description,
  required = false,
  placeholder,
  suggestions,
  maxTags,
  className,
}: TagInputProps) {
  const form = useFormContext();
  const value = (form.watch(name) as string[] | undefined) ?? [];
  const error = form.formState.errors[name]?.message as string | undefined;

  React.useEffect(() => {
    form.register(name);
  }, [form, name]);

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <Label htmlFor={name}>
          {label}
          {required ? <span className="ml-1 text-error-500">*</span> : null}
        </Label>
      ) : null}
      <SimpleTagInput
        value={value}
        onChange={(tags) =>
          form.setValue(name, tags, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
        placeholder={placeholder}
        suggestions={suggestions}
        maxTags={maxTags}
      />
      {description && !error ? <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{description}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
