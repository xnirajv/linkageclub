'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Edit,
  Copy,
  Trash2,
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { Input } from '@/components/ui/input';

interface Assessment {
  id: string;
  title: string;
  skillName: string;
  level: string;
  price: number;
  duration: number;
  totalAttempts: number;
  passRate: number;
  status: string;
  createdAt: string;
}

export default function AdminAssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch assessments on load
  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/assessments');
      const data = await response.json();
      
      if (data.success) {
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete assessment
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchAssessments(); // Refresh list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete assessment');
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      alert('Something went wrong');
    }
  };

  // Duplicate assessment
  const handleDuplicate = async (assessment: Assessment) => {
    try {
      // First fetch the full assessment details
      const response = await fetch(`/api/admin/assessments/${assessment.id}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch assessment details');
      }
      
      const original = data.assessment;
      
      // Create duplicate payload
      const duplicatePayload = {
        title: `${original.title} (Copy)`,
        description: original.description,
        skillName: original.skillName,
        level: original.level,
        price: original.price,
        duration: original.duration,
        passingScore: original.passingScore,
        questions: original.questions,
        badges: original.badges || [],
        prerequisites: original.prerequisites || [],
        tags: original.tags || [],
        isActive: false, // Draft by default
      };
      
      const createResponse = await fetch('/api/admin/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicatePayload),
      });
      
      if (createResponse.ok) {
        await fetchAssessments(); // Refresh list
        alert('Assessment duplicated successfully');
      } else {
        const errorData = await createResponse.json();
        alert(errorData.error || 'Failed to duplicate assessment');
      }
    } catch (error) {
      console.error('Error duplicating assessment:', error);
      alert('Something went wrong');
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.skillName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || assessment.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalRevenue = assessments.reduce((sum, a) => sum + (a.price * a.totalAttempts || 0), 0);
  const totalAttempts = assessments.reduce((sum, a) => sum + (a.totalAttempts || 0), 0);
  const averagePassRate = assessments.length > 0 
    ? assessments.reduce((sum, a) => sum + (a.passRate || 0), 0) / assessments.length 
    : 0;

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Management</h1>
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold">{assessments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Attempts</p>
              <p className="text-2xl font-bold">{formatNumber(totalAttempts)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Pass Rate</p>
              <p className="text-2xl font-bold">{averagePassRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assessments by title or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white py-2 px-3"
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
            className="rounded-md border border-gray-300 bg-white py-2 px-3"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
          <Button variant="outline" onClick={fetchAssessments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Assessments Table */}
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
            {filteredAssessments.map((assessment) => (
              <TableRow key={assessment.id}>
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
                <TableCell>{assessment.price === 0 ? 'Free' : formatCurrency(assessment.price)}</TableCell>
                <TableCell>{assessment.duration} min</TableCell>
                <TableCell>{formatNumber(assessment.totalAttempts)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          assessment.passRate >= 70 ? 'bg-green-600' :
                          assessment.passRate >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${assessment.passRate}%` }}
                      />
                    </div>
                    <span className="text-sm">{assessment.passRate}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={assessment.status === 'active' ? 'success' : 'secondary'}>
                    {assessment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/admin/assessments/${assessment.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/admin/assessments/${assessment.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(assessment)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(assessment.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No assessments found</p>
          </div>
        )}
      </Card>
    </div>
  );
}