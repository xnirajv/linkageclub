'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Clock, DollarSign, Award, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default function AssessmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAssessment();
    }
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/admin/assessments/${id}`);
      const data = await response.json();
      if (data.success) {
        setAssessment(data.assessment);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this assessment?')) return;
    const response = await fetch(`/api/admin/assessments/${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.push('/dashboard/admin/assessments');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!assessment) {
    return <div className="text-center py-12">Assessment not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin/assessments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="text-gray-500">{assessment.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/admin/assessments/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Clock className="h-5 w-5 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{assessment.duration} min</p>
          <p className="text-sm text-gray-500">Duration</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}</p>
          <p className="text-sm text-gray-500">Price</p>
        </Card>
        <Card className="p-4 text-center">
          <Award className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold">{assessment.passingScore}%</p>
          <p className="text-sm text-gray-500">Passing Score</p>
        </Card>
        <Card className="p-4 text-center">
          <Badge variant={assessment.isActive ? 'success' : 'secondary'} className="mt-2">
            {assessment.isActive ? 'Active' : 'Draft'}
          </Badge>
        </Card>
      </div>

      {/* Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Assessment Details</h2>
        <div className="space-y-3">
          <div className="flex">
            <span className="w-32 text-gray-500">Skill:</span>
            <span className="font-medium">{assessment.skillName}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Level:</span>
            <span className="font-medium capitalize">{assessment.level}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Questions:</span>
            <span className="font-medium">{assessment.questions?.length || 0}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {assessment.tags?.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary">{tag}</Badge>
              )) || '-'}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Users className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{formatNumber(assessment.totalAttempts || 0)}</p>
            <p className="text-sm text-gray-500">Total Attempts</p>
          </div>
          <div>
            <TrendingUp className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assessment.passRate || 0}%</p>
            <p className="text-sm text-gray-500">Pass Rate</p>
          </div>
          <div>
            <Award className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{assessment.averageScore || 0}%</p>
            <p className="text-sm text-gray-500">Avg. Score</p>
          </div>
        </div>
      </Card>
    </div>
  );
}