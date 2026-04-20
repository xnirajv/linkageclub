'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillName: '',
    level: 'intermediate',
    price: '',
    duration: '',
    passingScore: '70',
    isActive: false,
  });

  useEffect(() => {
    if (id) {
      fetchAssessment();
    }
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/admin/assessments/${id}`);
      const data = await response.json();
      
      if (data.success && data.assessment) {
        const a = data.assessment;
        setFormData({
          title: a.title || '',
          description: a.description || '',
          skillName: a.skillName || '',
          level: a.level || 'intermediate',
          price: a.price?.toString() || '',
          duration: a.duration?.toString() || '',
          passingScore: a.passingScore?.toString() || '70',
          isActive: a.isActive || false,
        });
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          skillName: formData.skillName,
          level: formData.level,
          price: parseInt(formData.price) || 0,
          duration: parseInt(formData.duration) || 30,
          passingScore: parseInt(formData.passingScore) || 70,
          isActive: formData.isActive,
        }),
      });
      
      if (response.ok) {
        router.push('/dashboard/admin/assessments');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this assessment?')) return;
    
    try {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/dashboard/admin/assessments');
        router.refresh();
      }
    } catch (error) {
      alert('Failed to delete');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin/assessments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Assessment</h1>
            <p className="text-gray-500">Update assessment details</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skill Name *</label>
              <Input
                value={formData.skillName}
                onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (min)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                min="5"
                max="180"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
              <Input
                type="number"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                min="50"
                max="90"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm">Active (visible to students)</label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/admin/assessments">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}