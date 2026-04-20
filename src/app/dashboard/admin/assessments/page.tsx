'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { Input } from '@/components/ui/input';

// Mock data - replace with actual API
const assessments = [
  {
    id: '1',
    title: 'React Advanced Certification',
    skillName: 'React',
    level: 'advanced',
    price: 199,
    duration: 60,
    totalAttempts: 1250,
    passRate: 68,
    revenue: 1250 * 199,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Node.js Fundamentals',
    skillName: 'Node.js',
    level: 'beginner',
    price: 0,
    duration: 45,
    totalAttempts: 3450,
    passRate: 82,
    revenue: 0,
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Python Data Science',
    skillName: 'Python',
    level: 'intermediate',
    price: 299,
    duration: 90,
    totalAttempts: 890,
    passRate: 71,
    revenue: 890 * 299,
    status: 'active',
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    title: 'System Design Interview',
    skillName: 'System Design',
    level: 'expert',
    price: 499,
    duration: 120,
    totalAttempts: 456,
    passRate: 45,
    revenue: 456 * 499,
    status: 'draft',
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    title: 'AWS Certified Developer',
    skillName: 'AWS',
    level: 'advanced',
    price: 399,
    duration: 90,
    totalAttempts: 678,
    passRate: 63,
    revenue: 678 * 399,
    status: 'active',
    createdAt: '2023-12-28',
  },
];

export default function AdminAssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assessment.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || assessment.level === levelFilter;
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalRevenue = assessments.reduce((sum, a) => sum + a.revenue, 0);
  const totalAttempts = assessments.reduce((sum, a) => sum + a.totalAttempts, 0);
  const averagePassRate = assessments.reduce((sum, a) => sum + a.passRate, 0) / assessments.length;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Assessment Management</h1>
            <p className="text-charcoal-600">Create and manage skill assessments</p>
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
                <p className="text-sm text-charcoal-500">Total Assessments</p>
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
                <p className="text-sm text-charcoal-500">Total Attempts</p>
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
                <p className="text-sm text-charcoal-500">Avg. Pass Rate</p>
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
                <p className="text-sm text-charcoal-500">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
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
              className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
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
              className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Assessments</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
            <TabsTrigger value="revenue">Top Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
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
                          <p className="text-xs text-charcoal-500">Created {new Date(assessment.createdAt).toLocaleDateString()}</p>
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
                          <div className="w-16 bg-charcoal-100 rounded-full h-2">
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
                        <Badge variant={assessment.status === 'active' ? 'success' : 'warning'}>
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
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
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
                  <p className="text-charcoal-500">No assessments found</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="active">
            {/* Similar table filtered for active assessments */}
          </TabsContent>

          <TabsContent value="draft">
            {/* Similar table filtered for draft assessments */}
          </TabsContent>

          <TabsContent value="popular">
            {/* Similar table sorted by attempts */}
          </TabsContent>

          <TabsContent value="revenue">
            {/* Similar table sorted by revenue */}
          </TabsContent>
        </Tabs>
      </div>
  );
}