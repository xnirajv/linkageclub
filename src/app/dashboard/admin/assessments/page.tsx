'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

interface Assessment {
  _id: string;
  title: string;
  skillName: string;
  level: string;
  price: number;
  duration: number;
  totalAttempts: number;
  passRate: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/assessments');
      const data = await response.json();

      if (data.assessments) {
        setAssessments(data.assessments || []);
      } else if (data.error) {
        setError(data.error);
      } else {
        setAssessments([]);
      }
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/admin/assessments/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/admin/assessments/${id}/edit`);
  };

  const handleDuplicate = async (id: string) => {
    setDuplicating(id);
    try {
      const response = await fetch(`/api/admin/assessments/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const assessment = data.assessment;

      const duplicatedData = {
        title: `${assessment.title} (Copy)`,
        description: assessment.description,
        skillName: assessment.skillName,
        level: assessment.level,
        price: assessment.price,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        questions: assessment.questions,
        badges: assessment.badges,
        prerequisites: assessment.prerequisites,
        tags: assessment.tags,
      };

      const createResponse = await fetch('/api/admin/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatedData),
      });

      if (createResponse.ok) {
        await fetchAssessments();
        alert('Assessment duplicated successfully!');
      } else {
        const err = await createResponse.json();
        throw new Error(err.error || 'Failed to duplicate');
      }
    } catch (err: any) {
      console.error('Error duplicating:', err);
      alert(err.message || 'Failed to duplicate assessment');
    } finally {
      setDuplicating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This cannot be undone.')) return;
    
    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAssessments(prev => prev.filter(a => a._id !== id));
        alert('Assessment deleted successfully!');
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete');
      }
    } catch (err: any) {
      console.error('Error deleting:', err);
      alert(err.message || 'Failed to delete assessment');
    } finally {
      setDeleting(null);
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch =
      assessment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.skillName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || assessment.level === levelFilter;
    const status = assessment.isActive ? 'active' : 'draft';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalRevenue = assessments.reduce((sum, a) => sum + ((a.price || 0) * (a.totalAttempts || 0)), 0);
  const totalAttempts = assessments.reduce((sum, a) => sum + (a.totalAttempts || 0), 0);
  const averagePassRate = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + (a.passRate || 0), 0) / assessments.length
    : 0;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
        <p className="text-gray-600">{error}</p>
        <Button variant="outline" onClick={fetchAssessments}>
          <RefreshCw className="mr-2 h-4 w-4" />Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessment Management</h1>
          <p className="text-gray-500">Create and manage skill assessments</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/assessments/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Award className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Assessments</p><p className="text-2xl font-bold">{assessments.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Users className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-gray-500">Total Attempts</p><p className="text-2xl font-bold">{formatNumber(totalAttempts)}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><TrendingUp className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-500">Avg. Pass Rate</p><p className="text-2xl font-bold">{averagePassRate.toFixed(1)}%</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><DollarSign className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-md border p-2 bg-white dark:bg-gray-800"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border p-2 bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
          <Button variant="outline" onClick={fetchAssessments}>
            <RefreshCw className="mr-2 h-4 w-4" />Refresh
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assessment</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Pass Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssessments.map((assessment) => {
              const assessmentId = assessment._id;
              const status = assessment.isActive ? 'active' : 'draft';

              return (
                <TableRow key={assessmentId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{assessment.title}</p>
                      <p className="text-xs text-gray-500">
                        Created {new Date(assessment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{assessment.skillName}</TableCell>
                  <TableCell>
                    <Badge className={getLevelColor(assessment.level)}>
                      {assessment.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}
                  </TableCell>
                  <TableCell>{assessment.duration} min</TableCell>
                  <TableCell>{formatNumber(assessment.totalAttempts)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (assessment.passRate || 0) >= 70
                              ? 'bg-green-600'
                              : (assessment.passRate || 0) >= 50
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${assessment.passRate || 0}%` }}
                        />
                      </div>
                      <span>{assessment.passRate || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(assessmentId)} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(assessmentId)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(assessmentId)} disabled={duplicating === assessmentId} className="cursor-pointer">
                          {duplicating === assessmentId ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(assessmentId)} disabled={deleting === assessmentId} className="cursor-pointer text-red-600 focus:text-red-600">
                          {deleting === assessmentId ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredAssessments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-lg">No assessments found</p>
          </div>
        )}
      </Card>
    </div>
  );
}