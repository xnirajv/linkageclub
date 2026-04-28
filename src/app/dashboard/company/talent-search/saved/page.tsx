'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Star, MapPin, Briefcase, Mail, MessageCircle, Calendar, Bookmark, Trash2, FolderPlus, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/forms/Textarea';
import DashboardLayout from '@/app/dashboard/layout';

interface SavedCandidate {
  id: string; name: string; role: string; avatar: string; location: string;
  skills: string[]; experience: string; education: string; trustScore: number;
  availability: string; expectedSalary: string; savedAt: string;
  tags: string[]; notes: string; matchScore: number;
}

const savedCandidates: SavedCandidate[] = [
  { id: 'c1', name: 'Riya Sharma', role: 'Full Stack Developer', avatar: '/avatars/riya.jpg', location: 'Mumbai', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'], experience: '3 years', education: 'B.Tech CS, VIT', trustScore: 92, availability: 'Immediate', expectedSalary: '12-15 LPA', savedAt: '2024-02-15T10:30:00', tags: ['frontend', 'mern', 'top-pick'], notes: 'Great communication skills', matchScore: 95 },
  { id: 'c2', name: 'Amit Kumar', role: 'Backend Developer', avatar: '/avatars/amit.jpg', location: 'Bangalore', skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'], experience: '4 years', education: 'M.Tech, IIT Delhi', trustScore: 88, availability: '15 days', expectedSalary: '18-22 LPA', savedAt: '2024-02-14T14:20:00', tags: ['backend', 'aws'], notes: 'Strong system design', matchScore: 88 },
];

export default function SavedTalentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<SavedCandidate | null>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState('');

  const filteredCandidates = savedCandidates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNotes = (candidate: SavedCandidate) => { setSelectedCandidate(candidate); setCandidateNotes(candidate.notes || ''); setShowNotesDialog(true); };
  const handleSaveNotes = () => { console.log('Saving notes:', selectedCandidate?.id, candidateNotes); setShowNotesDialog(false); };
  const handleRemoveSaved = (id: string) => { if (confirm('Remove this candidate?')) console.log('Removing:', id); };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Saved Talent</h1><p className="text-gray-600">Candidates you&apos;ve bookmarked</p></div>
          <Button variant="outline"><FolderPlus className="mr-2 h-4 w-4" />New Collection</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4"><p className="text-sm text-gray-500">Saved</p><p className="text-2xl font-bold">{savedCandidates.length}</p></Card>
          <Card className="p-4"><p className="text-sm text-gray-500">High Match (&gt;90%)</p><p className="text-2xl font-bold text-green-600">{savedCandidates.filter((c) => c.matchScore >= 90).length}</p></Card>
          <Card className="p-4"><p className="text-sm text-gray-500">Immediate Joiners</p><p className="text-2xl font-bold text-blue-600">{savedCandidates.filter((c) => c.availability === 'Immediate').length}</p></Card>
        </div>

        <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search saved candidates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>

        <Tabs defaultValue="all">
          <TabsList><TabsTrigger value="all">All ({filteredCandidates.length})</TabsTrigger><TabsTrigger value="high-match">High Match</TabsTrigger></TabsList>
          <TabsContent value="all" className="space-y-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16"><AvatarImage src={candidate.avatar} /><AvatarFallback>{candidate.name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1"><h3 className="text-lg font-semibold">{candidate.name}</h3><Badge variant="success" className="flex items-center gap-1"><Star className="h-3 w-3 fill-current" />{candidate.matchScore}% Match</Badge></div>
                        <p className="text-primary-600 font-medium">{candidate.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAddNotes(candidate)}><Bookmark className="mr-2 h-4 w-4" />Notes</Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleRemoveSaved(candidate.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{candidate.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{candidate.experience}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{candidate.availability}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{candidate.expectedSalary}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">{candidate.skills.map((skill) => (<Badge key={skill} variant="skill" size="sm">{skill}</Badge>))}</div>
                    {candidate.notes && <div className="mt-3 p-3 bg-gray-50 rounded-lg"><p className="text-sm text-gray-700"><span className="font-medium">Notes:</span> {candidate.notes}</p></div>}
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" asChild><Link href={`/profile/${candidate.id}`}>View Profile</Link></Button>
                      <Button size="sm" variant="outline"><Mail className="mr-2 h-4 w-4" />Contact</Button>
                      <Button size="sm" variant="outline"><MessageCircle className="mr-2 h-4 w-4" />Message</Button>
                      <Button size="sm" variant="outline"><Calendar className="mr-2 h-4 w-4" />Schedule</Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Saved on {new Date(candidate.savedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))}
            {filteredCandidates.length === 0 && <Card className="p-12 text-center"><Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">No saved candidates</h3><Button asChild className="mt-4"><Link href="/dashboard/company/talent-search">Browse Talent</Link></Button></Card>}
          </TabsContent>
        </Tabs>

        <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Notes</DialogTitle></DialogHeader>
            {selectedCandidate && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Avatar className="h-10 w-10"><AvatarImage src={selectedCandidate.avatar} /><AvatarFallback>{selectedCandidate.name[0]}</AvatarFallback></Avatar><div><p className="font-medium">{selectedCandidate.name}</p><p className="text-sm text-gray-500">{selectedCandidate.role}</p></div></div>
                <div><label className="block text-sm font-medium mb-1">Notes</label><Textarea value={candidateNotes} onChange={(e) => setCandidateNotes(e.target.value)} placeholder="Add your observations..." rows={4} /></div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setShowNotesDialog(false)}>Cancel</Button><Button onClick={handleSaveNotes}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}