'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Edit, Trash2, Clock, DollarSign, Award,
  Users, TrendingUp, BookOpen, Loader2, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default function AssessmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/assessments/${id}`);
      const data = await response.json();
      if (data.assessment) {
        setAssessment(data.assessment);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Assessment not found');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this assessment? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/assessments/${id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/dashboard/admin/assessments');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete assessment');
    } finally {
      setDeleting(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <p className="text-lg text-gray-600">{error}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/admin/assessments">Back to Assessments</Link>
        </Button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lg text-gray-600">Assessment not found</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/admin/assessments">Back to Assessments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin/assessments"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="text-gray-500 line-clamp-2">{assessment.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/admin/assessments/${id}/edit`}><Edit className="mr-2 h-4 w-4" />Edit</Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center"><Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold">{assessment.duration} min</p><p className="text-sm text-gray-500">Duration</p></Card>
        <Card className="p-4 text-center"><DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold">{assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}</p><p className="text-sm text-gray-500">Price</p></Card>
        <Card className="p-4 text-center"><Award className="h-5 w-5 text-yellow-600 mx-auto mb-2" /><p className="text-2xl font-bold">{assessment.passingScore}%</p><p className="text-sm text-gray-500">Passing Score</p></Card>
        <Card className="p-4 text-center"><BookOpen className="h-5 w-5 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold">{assessment.questions?.length || 0}</p><p className="text-sm text-gray-500">Questions</p></Card>
        <Card className="p-4 text-center"><Badge variant={assessment.isActive ? 'default' : 'secondary'} className="mt-2">{assessment.isActive ? 'Active' : 'Draft'}</Badge></Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Assessment Details</h2>
        <div className="space-y-3">
          <div className="flex"><span className="w-32 text-gray-500">Skill:</span><span className="font-medium">{assessment.skillName}</span></div>
          <div className="flex"><span className="w-32 text-gray-500">Level:</span><Badge className={getLevelColor(assessment.level)}>{assessment.level}</Badge></div>
          <div className="flex"><span className="w-32 text-gray-500">Tags:</span><div className="flex flex-wrap gap-1">{assessment.tags?.length > 0 ? assessment.tags.map((tag: string, i: number) => (<Badge key={i} variant="secondary">{tag}</Badge>)) : <span className="text-gray-400">-</span>}</div></div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><Users className="h-5 w-5 text-gray-400 mx-auto mb-2" /><p className="text-2xl font-bold">{formatNumber(assessment.totalAttempts || 0)}</p><p className="text-sm text-gray-500">Total Attempts</p></div>
          <div><TrendingUp className="h-5 w-5 text-gray-400 mx-auto mb-2" /><p className="text-2xl font-bold">{assessment.passRate || 0}%</p><p className="text-sm text-gray-500">Pass Rate</p></div>
          <div><Award className="h-5 w-5 text-gray-400 mx-auto mb-2" /><p className="text-2xl font-bold">{assessment.averageScore || 0}%</p><p className="text-sm text-gray-500">Avg. Score</p></div>
        </div>
      </Card>

      {assessment.badges && assessment.badges.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessment.badges.map((badge: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-yellow-100 rounded-full"><Award className="h-5 w-5 text-yellow-600" /></div>
                <div><p className="font-medium">{badge.name}</p><p className="text-sm text-gray-500">{badge.description}</p><p className="text-xs text-gray-400">Score {badge.requiredScore}%+</p></div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Questions ({assessment.questions?.length || 0})</h2>
        <div className="space-y-3">
          {assessment.questions?.map((q: any, idx: number) => (
            <div key={idx} className="p-3 border rounded-lg">
              <p className="font-medium text-sm">Q{idx + 1}: {q.question}</p>
              <p className="text-xs text-gray-500 mt-1">{q.options?.length} options • {q.points || 1} pts</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}