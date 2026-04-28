'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  mandatory: boolean;
}

interface SkillInputProps {
  value: Skill[];
  onChange: (skills: Skill[]) => void;
  suggestions?: string[];
  maxSkills?: number;
}

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function SkillInput({ value = [], onChange, suggestions = [], maxSkills = 10 }: SkillInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    if (value.length >= maxSkills) return;
    if (value.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...value, { name: trimmed, level: 'intermediate', mandatory: true }]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeSkill = (index: number) => onChange(value.filter((_, i) => i !== index));
  const updateSkillLevel = (index: number, level: Skill['level']) => onChange(value.map((s, i) => (i === index ? { ...s, level } : s)));
  const toggleMandatory = (index: number) => onChange(value.map((s, i) => (i === index ? { ...s, mandatory: !s.mandatory } : s)));

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && inputValue) { e.preventDefault(); addSkill(inputValue); } };

  const filteredSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.name.toLowerCase() === s.toLowerCase()) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input value={inputValue} onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }} onKeyDown={handleKeyDown} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="Add skills (e.g., React, Node.js)" />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full rounded-xl border bg-white p-2 shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((s) => (
                <button key={s} type="button" onMouseDown={(e) => { e.preventDefault(); addSkill(s); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
        <Button type="button" variant="outline" onClick={() => addSkill(inputValue)} disabled={!inputValue.trim() || value.length >= maxSkills}><Plus className="h-4 w-4" /></Button>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((skill, index) => (
            <div key={`${skill.name}-${index}`} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 p-3 hover:border-gray-300 transition-colors">
              <div className="flex-1 min-w-0"><span className="font-medium text-sm truncate block">{skill.name}</span></div>
              <select value={skill.level} onChange={(e) => updateSkillLevel(index, e.target.value as Skill['level'])} className="rounded-lg border border-gray-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                {levelOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
              <button type="button" onClick={() => toggleMandatory(index)} className={`text-xs px-2 py-1 rounded-lg border transition-colors whitespace-nowrap ${skill.mandatory ? 'bg-primary-100 text-primary-700 border-primary-300 hover:bg-primary-200' : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'}`}>{skill.mandatory ? '✓ Required' : 'Optional'}</button>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)} className="shrink-0 hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          ))}
        </div>
      )}
      {value.length > 0 && <p className="text-xs text-gray-500">{value.length}/{maxSkills} skills added</p>}
    </div>
  );
}