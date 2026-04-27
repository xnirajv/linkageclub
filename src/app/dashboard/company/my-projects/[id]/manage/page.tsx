'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  Paperclip,
  User,
  MessageSquare,
  DollarSign,
  Star,
  ExternalLink,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/forms/Textarea';
import { Loader2 } from 'lucide-react';

type TabValue = 'overview' | 'milestones' | 'candidate' | 'communication' | 'payments';

interface MilestoneData {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  deadline: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved';
  feedback?: string;
  deliverables?: string[];
  completedAt?: string;
  approvedAt?: string;
}

interface CandidateData {
  _id: string;
  name: string;
  avatar?: string;
  trustScore?: number;
  location?: string;
  skills?: Array<{ name: string; level: string; verified: boolean }>;
  bio?: string;
}

interface Message {
  id: string;
  sender: string;
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    approved: 'bg-purple-100 text-purple-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'in_progress': return <Play className="h-4 w-4 text-blue-600" />;
    case 'approved': return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
    default: return <Clock className="h-4 w-4 text-yellow-600" />;
  }
}

export default function ManageProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabValue>('overview');
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) fetchAllData();
  }, [projectId]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectRes, milestoneRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/milestones`),
      ]);

      const projectData = await projectRes.json();
      const milestoneData = await milestoneRes.json();

      if (projectData.success || projectData.data) {
        const proj = projectData.data?.project || projectData.project;
        setProject(proj);
        if (proj?.selectedApplicant) {
          setCandidate(proj.selectedApplicant);
        }
      }

      if (milestoneData.milestones) {
        setMilestones(milestoneData.milestones);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneAction = async (
    milestoneId: string,
    action: 'approve' | 'request_changes' | 'reject'
  ) => {
    setActionLoading(milestoneId);
    try {
      const statusMap = {
        approve: 'approved',
        request_changes: 'in_progress',
        reject: 'pending',
      };

      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          status: statusMap[action],
          feedback: feedback[milestoneId] || '',
        }),
      });

      if (response.ok) {
        fetchAllData();
        setFeedback((prev) => ({ ...prev, [milestoneId]: '' }));
      } else {
        const err = await response.json();
        alert(err.error || 'Action failed');
      }
    } catch (err) {
      alert('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'You',
        senderName: 'You',
        message: newMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    setNewMessage('');
  };

  const milestoneStats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === 'approved').length;
    const totalBudget = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
    const released = milestones
      .filter((m) => m.status === 'approved')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    return { total, completed, progress: total > 0 ? Math.round((completed / total) * 100) : 0, totalBudget, released };
  }, [milestones]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600">{error || 'Project not found'}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={getStatusBadge(project.status)}>
                {project.status === 'open' ? 'Active' : project.status}
              </Badge>
              <span className="text-sm text-gray-500">
                {milestoneStats.progress}% Complete • {project.duration || 0} days duration
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/company/my-projects/${projectId}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Public Page
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-500">Title:</span><span className="font-medium">{project.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Category:</span><span>{project.category}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Budget:</span><span className="font-medium">{formatCurrency(project.budget?.min || 0)} - {formatCurrency(project.budget?.max || 0)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration:</span><span>{project.duration} days</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Posted:</span><span>{new Date(project.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status:</span><Badge className={getStatusBadge(project.status)}>{project.status || 'Active'}</Badge></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/messages"><MessageSquare className="mr-2 h-4 w-4" />Message Candidate</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('milestones')}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />Review Milestones
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('payments')}>
                  <DollarSign className="mr-2 h-4 w-4" />Release Payment
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600">
                  <AlertCircle className="mr-2 h-4 w-4" />Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>

          {project.skills?.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Skills Required</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill: any, i: number) => (
                    <Badge key={i} variant="secondary" className="text-sm px-3 py-1">
                      {skill.name || skill} {skill.level && `(${skill.level})`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Project Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MILESTONES TAB */}
        <TabsContent value="milestones" className="space-y-4 mt-6">
          {milestones.length === 0 ? (
            <Card className="p-12 text-center"><p className="text-gray-500">No milestones yet</p></Card>
          ) : (
            milestones.map((milestone) => (
              <Card key={milestone._id}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(milestone.status)}
                      <h3 className="font-semibold text-lg">{milestone.title}</h3>
                      <Badge className={getStatusBadge(milestone.status)}>
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(milestone.amount)} • Day {milestone.deadline}
                    </span>
                  </div>

                  {milestone.deliverables && milestone.deliverables.length > 0 && (
                    <div className="pl-7">
                      <p className="text-xs font-medium text-gray-500 mb-1">Deliverables:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {milestone.deliverables.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {milestone.feedback && (
                    <div className="bg-gray-50 rounded-lg p-3 pl-7">
                      <p className="text-xs font-medium text-gray-500">Feedback:</p>
                      <p className="text-sm text-gray-700">{milestone.feedback}</p>
                    </div>
                  )}

                  {milestone.status === 'completed' && (
                    <div className="space-y-2">
                      <Textarea
                        rows={2}
                        placeholder="Your feedback..."
                        value={feedback[milestone._id] || ''}
                        onChange={(e) => setFeedback((prev) => ({ ...prev, [milestone._id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleMilestoneAction(milestone._id, 'approve')}
                          disabled={actionLoading === milestone._id}
                        >
                          {actionLoading === milestone._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-12" />
                          ) : (
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                          )}
                          Approve & Release Payment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMilestoneAction(milestone._id, 'request_changes')}
                          disabled={actionLoading === milestone._id}
                        >
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Request Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleMilestoneAction(milestone._id, 'reject')}
                          disabled={actionLoading === milestone._id}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {milestone.status === 'in_progress' && (
                    <Button size="sm" variant="outline">
                      Request Update
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* CANDIDATE TAB */}
        <TabsContent value="candidate" className="space-y-6 mt-6">
          {candidate ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                    {candidate.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{candidate.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500">
                      Trust Score: {candidate.trustScore || 0}% • {candidate.location || 'N/A'}
                    </p>
                    {/* ✅ Fixed: proper optional check */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {candidate.skills.map((skill: any, i: number) => (
                          <Badge key={i} variant="secondary" className="gap-1">
                            {skill.name} ({skill.level})
                            {skill.verified && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {candidate.bio && (
                      <p className="text-gray-600 mt-3">{candidate.bio}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm">
                        <User className="mr-1 h-4 w-4" />View Full Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-1 h-4 w-4" />Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="mr-1 h-4 w-4" />Rate Candidate
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No candidate hired yet</p>
            </Card>
          )}
        </TabsContent>

        {/* COMMUNICATION TAB */}
        <TabsContent value="communication" className="space-y-4 mt-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 ${msg.sender === 'You' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button size="icon" variant="outline">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-500">Total Budget:</span><span className="font-semibold">{formatCurrency(milestoneStats.totalBudget)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Released:</span><span className="font-semibold text-green-600">{formatCurrency(milestoneStats.released)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pending:</span><span className="font-semibold text-yellow-600">{formatCurrency(milestoneStats.totalBudget - milestoneStats.released)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Platform Commission (10%):</span><span>{formatCurrency(milestoneStats.totalBudget * 0.1)}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Milestone Payments</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {milestones.map((m) => (
                  <div key={m._id} className="flex justify-between items-center p-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{m.title}</p>
                      <p className="text-xs text-gray-500">{m.status.replace('_', ' ')}</p>
                    </div>
                    <span className={`font-medium text-sm ${m.status === 'approved' ? 'text-green-600' : 'text-gray-400'}`}>
                      {formatCurrency(m.amount)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}