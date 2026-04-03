'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  MessageCircle,
  Calendar,
  Bookmark,
  Trash2,
  FolderPlus,
  Clock,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/forms/Textarea';
import DashboardLayout from '@/app/dashboard/layout';

// Mock data - replace with actual API
const savedCandidates = [
  {
    id: 'c1',
    name: 'Riya Sharma',
    role: 'Full Stack Developer',
    avatar: '/avatars/riya.jpg',
    location: 'Mumbai',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    experience: '3 years',
    education: 'B.Tech CS, VIT',
    trustScore: 92,
    availability: 'Immediate',
    expectedSalary: '12-15 LPA',
    savedAt: '2024-02-15T10:30:00',
    tags: ['frontend', 'mern', 'top-pick'],
    notes: 'Great communication skills, impressive portfolio',
    matchScore: 95,
  },
  {
    id: 'c2',
    name: 'Amit Kumar',
    role: 'Backend Developer',
    avatar: '/avatars/amit.jpg',
    location: 'Bangalore',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
    experience: '4 years',
    education: 'M.Tech, IIT Delhi',
    trustScore: 88,
    availability: '15 days',
    expectedSalary: '18-22 LPA',
    savedAt: '2024-02-14T14:20:00',
    tags: ['backend', 'aws', 'microservices'],
    notes: 'Strong system design skills',
    matchScore: 88,
  },
  {
    id: 'c3',
    name: 'Priya Patel',
    role: 'Frontend Developer',
    avatar: '/avatars/priya.jpg',
    location: 'Pune',
    skills: ['React', 'Vue.js', 'TypeScript', 'Next.js'],
    experience: '2 years',
    education: 'BCA, Pune University',
    trustScore: 85,
    availability: 'Immediate',
    expectedSalary: '8-10 LPA',
    savedAt: '2024-02-13T09:15:00',
    tags: ['frontend', 'ui/ux', 'junior'],
    notes: 'Good portfolio, eager to learn',
    matchScore: 82,
  },
  {
    id: 'c4',
    name: 'Rahul Mehta',
    role: 'DevOps Engineer',
    avatar: '/avatars/rahul.jpg',
    location: 'Hyderabad',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'],
    experience: '5 years',
    education: 'B.Tech, NIT Warangal',
    trustScore: 94,
    availability: '30 days',
    expectedSalary: '20-25 LPA',
    savedAt: '2024-02-12T16:45:00',
    tags: ['devops', 'cloud', 'senior'],
    notes: 'AWS certified, previous experience at Amazon',
    matchScore: 91,
  },
  {
    id: 'c5',
    name: 'Neha Singh',
    role: 'Data Scientist',
    avatar: '/avatars/neha.jpg',
    location: 'Delhi',
    skills: ['Python', 'TensorFlow', 'SQL', 'Tableau'],
    experience: '3 years',
    education: 'M.Sc Statistics, DU',
    trustScore: 87,
    availability: 'Immediate',
    expectedSalary: '14-18 LPA',
    savedAt: '2024-02-11T11:30:00',
    tags: ['data-science', 'ml', 'analytics'],
    notes: 'Published research papers, strong analytical skills',
    matchScore: 84,
  },
];

const collections = [
  { id: 'col1', name: 'Top Picks', count: 5 },
  { id: 'col2', name: 'Frontend Developers', count: 3 },
  { id: 'col3', name: 'Immediate Joiners', count: 4 },
  { id: 'col4', name: 'Senior Candidates', count: 2 },
];

export default function SavedTalentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');

  const filteredCandidates = savedCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRemoveSaved = (candidateId: string) => {
    if (confirm('Remove this candidate from saved list?')) {
      console.log('Removing candidate:', candidateId);
    }
  };

  const handleAddNotes = (candidate: any) => {
    setSelectedCandidate(candidate);
    setCandidateNotes(candidate.notes || '');
    setShowNotesDialog(true);
  };

  const handleSaveNotes = () => {
    console.log('Saving notes for:', selectedCandidate.id, candidateNotes);
    setShowNotesDialog(false);
    setSelectedCandidate(null);
    setCandidateNotes('');
  };

  const handleMoveToCollection = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowMoveDialog(true);
  };

  const handleMoveConfirm = () => {
    console.log('Moving candidate to collection:', selectedCollection, selectedCandidate.id);
    setShowMoveDialog(false);
    setSelectedCandidate(null);
    setSelectedCollection('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Saved Talent</h1>
            <p className="text-charcoal-600">Candidates you've bookmarked for later</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Saved Candidates</p>
            <p className="text-2xl font-bold">{savedCandidates.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Collections</p>
            <p className="text-2xl font-bold">{collections.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">High Match (&gt;90%)</p>
            <p className="text-2xl font-bold text-green-600">
              {savedCandidates.filter(c => c.matchScore >= 90).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-charcoal-500">Immediate Joiners</p>
            <p className="text-2xl font-bold text-blue-600">
              {savedCandidates.filter(c => c.availability === 'Immediate').length}
            </p>
          </Card>
        </div>

        {/* Collections Bar */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="skill" className="px-3 py-2 cursor-pointer bg-primary-100">
            All Candidates
          </Badge>
          {collections.map((collection) => (
            <Badge
              key={collection.id}
              variant="skill"
              className="px-3 py-2 cursor-pointer hover:bg-charcoal-100"
            >
              {collection.name} ({collection.count})
            </Badge>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <Input
            placeholder="Search saved candidates by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Saved ({filteredCandidates.length})</TabsTrigger>
            <TabsTrigger value="recent">Recently Saved</TabsTrigger>
            <TabsTrigger value="high-match">High Match</TabsTrigger>
            <TabsTrigger value="with-notes">With Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={candidate.avatar} />
                    <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{candidate.name}</h3>
                          <Badge variant="success" className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {candidate.matchScore}% Match
                          </Badge>
                        </div>
                        <p className="text-primary-600 font-medium">{candidate.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAddNotes(candidate)}>
                          <Bookmark className="mr-2 h-4 w-4" />
                          Notes
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleMoveToCollection(candidate)}>
                          <FolderPlus className="mr-2 h-4 w-4" />
                          Move
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleRemoveSaved(candidate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-charcoal-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {candidate.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {candidate.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {candidate.education}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {candidate.availability}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {candidate.expectedSalary}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="skill" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {candidate.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {candidate.notes && (
                      <div className="mt-3 p-3 bg-charcoal-100/50 rounded-lg">
                        <p className="text-sm text-charcoal-700">
                          <span className="font-medium">Notes:</span> {candidate.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" asChild>
                        <Link href={`/profile/${candidate.id}`}>
                          View Profile
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                      </Button>
                    </div>

                    <p className="text-xs text-charcoal-400 mt-3">
                      Saved on {formatDate(candidate.savedAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {filteredCandidates.length === 0 && (
              <Card className="p-12 text-center">
                <Bookmark className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved candidates</h3>
                <p className="text-charcoal-500 mb-4">
                  Candidates you save will appear here for quick access
                </p>
                <Button asChild>
                  <Link href="/dashboard/company/talent-search">Browse Talent</Link>
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {/* Similar structure filtered by date */}
          </TabsContent>

          <TabsContent value="high-match" className="space-y-4">
            {/* Similar structure filtered by match score */}
          </TabsContent>

          <TabsContent value="with-notes" className="space-y-4">
            {/* Similar structure filtered by notes presence */}
          </TabsContent>
        </Tabs>

        {/* Notes Dialog */}
        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Notes</DialogTitle>
              <DialogDescription>
                Add private notes about this candidate
              </DialogDescription>
            </DialogHeader>

            {selectedCandidate && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-charcoal-100/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedCandidate.avatar} />
                    <AvatarFallback>{selectedCandidate.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedCandidate.name}</p>
                    <p className="text-sm text-charcoal-500">{selectedCandidate.role}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Textarea
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    placeholder="Add your observations, interview feedback, or follow-up items..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move to Collection Dialog */}
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Move to Collection</DialogTitle>
              <DialogDescription>
                Choose a collection to move this candidate to
              </DialogDescription>
            </DialogHeader>

            {selectedCandidate && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-charcoal-100/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedCandidate.avatar} />
                    <AvatarFallback>{selectedCandidate.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedCandidate.name}</p>
                    <p className="text-sm text-charcoal-500">{selectedCandidate.role}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Collection</label>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="">Select collection</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name} ({col.count} candidates)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Input placeholder="Or create new collection..." />
                  <Button variant="outline" size="sm">Create</Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMoveConfirm}>
                Move Candidate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
