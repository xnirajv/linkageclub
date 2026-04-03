'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface Requirement {
  role: string;
  skills: string[];
  equity: string;
  description: string;
}

interface TeamRequirementsProps {
  requirements?: Requirement[];
  onChange?: (requirements: Requirement[]) => void;
}

export function TeamRequirements({ requirements = [], onChange }: TeamRequirementsProps) {
  const [reqs, setReqs] = useState<Requirement[]>(requirements);
  const [showForm, setShowForm] = useState(false);
  const [newReq, setNewReq] = useState<Requirement>({ role: '', skills: [], equity: '', description: '' });
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim()) {
      setNewReq({ ...newReq, skills: [...newReq.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const save = () => {
    if (!newReq.role) return;
    const updated = [...reqs, newReq];
    setReqs(updated);
    onChange?.(updated);
    setNewReq({ role: '', skills: [], equity: '', description: '' });
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Team Requirements</CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Role *</label>
                <input className="w-full border rounded px-2 py-1.5 text-sm bg-background" placeholder="e.g. CTO, Designer" value={newReq.role} onChange={(e) => setNewReq({ ...newReq, role: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Equity Offered</label>
                <input className="w-full border rounded px-2 py-1.5 text-sm bg-background" placeholder="e.g. 10-20%" value={newReq.equity} onChange={(e) => setNewReq({ ...newReq, equity: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Description</label>
              <textarea className="w-full border rounded px-2 py-1.5 text-sm bg-background" rows={2} value={newReq.description} onChange={(e) => setNewReq({ ...newReq, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Skills Needed</label>
              <div className="flex gap-2 mb-1">
                <input className="flex-1 border rounded px-2 py-1.5 text-sm bg-background" placeholder="Add skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <Button variant="outline" size="xs" onClick={addSkill}>+</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {newReq.skills.map((s) => (
                  <Badge key={s} variant="skill" size="sm" className="gap-1">
                    {s}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setNewReq({ ...newReq, skills: newReq.skills.filter((x) => x !== s) })} />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={!newReq.role}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {!reqs.length && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-4">No team requirements added yet</p>
        )}

        {reqs.map((req, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{req.role}</h4>
              {req.equity && <Badge variant="outline" size="sm">{req.equity} equity</Badge>}
            </div>
            {req.description && <p className="text-sm text-muted-foreground mb-2">{req.description}</p>}
            <div className="flex flex-wrap gap-1">
              {req.skills.map((s) => <Badge key={s} variant="skill" size="sm">{s}</Badge>)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
