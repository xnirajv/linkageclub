'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  MoreVertical,
  Eye,
  Trash2,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/format';
import DashboardLayout from '../../layout';

// Mock data - replace with actual API
const projects = [
  {
    id: '1',
    title: 'E-commerce Platform Development',
    company: {
      name: 'TechCorp',
      avatar: '/avatars/techcorp.jpg',
    },
    budget: { min: 50000, max: 70000 },
    status: 'open',
    applications: 12,
    createdAt: '2024-02-10',
    category: 'Web Development',
    reported: false,
  },
  {
    id: '2',
    title: 'Mobile App Design',
    company: {
      name: 'DesignStudio',
      avatar: '/avatars/designstudio.jpg',
    },
    budget: { min: 30000, max: 50000 },
    status: 'in_progress',
    applications: 8,
    createdAt: '2024-02-08',
    category: 'Design',
    reported: true,
  },
  {
    id: '3',
    title: 'AI-Powered Dashboard',
    company: {
      name: 'DataViz',
      avatar: '/avatars/dataviz.jpg',
    },
    budget: { min: 80000, max: 120000 },
    status: 'completed',
    applications: 15,
    createdAt: '2024-02-01',
    category: 'AI/ML',
    reported: false,
  },
  {
    id: '4',
    title: 'DevOps Pipeline Setup',
    company: {
      name: 'CloudScale',
      avatar: '/avatars/cloudscale.jpg',
    },
    budget: { min: 40000, max: 60000 },
    status: 'cancelled',
    applications: 5,
    createdAt: '2024-01-28',
    category: 'DevOps',
    reported: false,
  },
];

export default function AdminProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-charcoal-100 text-charcoal-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Briefcase className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950">Project Management</h1>
          <p className="text-charcoal-600">Monitor and manage all platform projects</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Total Projects</p>
            <p className="text-2xl font-bold">{projects.length}</p>
          </Card>
          <Card className="p-4 bg-green-50">
            <p className="text-sm text-green-600">Open</p>
            <p className="text-2xl font-bold text-green-600">
              {projects.filter(p => p.status === 'open').length}
            </p>
          </Card>
          <Card className="p-4 bg-blue-50">
            <p className="text-sm text-blue-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {projects.filter(p => p.status === 'in_progress').length}
            </p>
          </Card>
          <Card className="p-4 bg-red-50">
            <p className="text-sm text-red-600">Reported</p>
            <p className="text-2xl font-bold text-red-600">
              {projects.filter(p => p.reported).length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search projects by title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
            >
              <option value="all">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Design">Design</option>
              <option value="DevOps">DevOps</option>
            </select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="reported">Reported</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {project.reported && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{project.title}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={project.company.avatar} />
                            <AvatarFallback>{project.company.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{project.company.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{project.category}</TableCell>
                      <TableCell>{formatCurrency(project.budget.min)} - {formatCurrency(project.budget.max)}</TableCell>
                      <TableCell>{project.applications}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(project.status)}
                            {project.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
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
                              <Link href={`/dashboard/admin/projects/${project.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View Applications
                            </DropdownMenuItem>
                            {project.reported && (
                              <DropdownMenuItem>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Review Reports
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Other tabs follow the same pattern with filtered data */}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}