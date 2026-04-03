'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { ArrowLeft, Upload, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';

interface TeamMember {
  name: string;
  role: string;
  linkedin?: string;
  bio?: string;
}

interface Investor {
  name: string;
  type: 'angel' | 'vc' | 'accelerator';
  amount?: string;
  date?: string;
}

interface Milestone {
  title: string;
  date: string;
  description: string;
}

export default function EditStartupProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: profile?.startupName || '',
    tagline: profile?.tagline || '',
    description: profile?.bio || '',
    website: profile?.website || '',
    location: profile?.location || '',
    foundedDate: profile?.foundedDate
      ? new Date(profile.foundedDate).toISOString().split('T')[0]
      : '',
    stage: profile?.stage || 'idea',
    industry: profile?.industry || '',
    teamSize: profile?.teamSize || '1',
    fundingRaised: profile?.fundingRaised || '',
    fundingStage: profile?.fundingStage || '',
    problemStatement: profile?.problemStatement || '',
    solution: profile?.solution || '',
    targetMarket: profile?.targetMarket || '',
    businessModel: profile?.businessModel || '',
    competitiveAdvantage: profile?.competitiveAdvantage || '',
  });

  // Dynamic arrays
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    profile?.teamMembers || [{ name: '', role: '' }]
  );
  const [investors, setInvestors] = useState<Investor[]>(
    profile?.investors || []
  );
  const [milestones, setMilestones] = useState<Milestone[]>(
    profile?.milestones || []
  );
  const [lookingFor, setLookingFor] = useState<string[]>(
    profile?.lookingFor || ['Co-founder', 'Tech Team', 'Advisors']
  );
  const [newLookingFor, setNewLookingFor] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  // Team members handlers
  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', role: '' }]);
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  // Investors handlers
  const handleAddInvestor = () => {
    setInvestors([...investors, { name: '', type: 'angel' }]);
  };

  const handleInvestorChange = (index: number, field: keyof Investor, value: string) => {
    const updated = [...investors];
    updated[index] = { ...updated[index], [field]: value };
    setInvestors(updated);
  };

  const handleRemoveInvestor = (index: number) => {
    setInvestors(investors.filter((_, i) => i !== index));
  };

  // Milestones handlers
  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', date: '', description: '' }]);
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // Looking for handlers
  const handleAddLookingFor = () => {
    if (newLookingFor.trim() && !lookingFor.includes(newLookingFor.trim())) {
      setLookingFor([...lookingFor, newLookingFor.trim()]);
      setNewLookingFor('');
    }
  };

  const handleRemoveLookingFor = (item: string) => {
    setLookingFor(lookingFor.filter(i => i !== item));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        startupName: formData.name,
        tagline: formData.tagline,
        bio: formData.description,
        website: formData.website,
        location: formData.location,
        foundedDate: formData.foundedDate,
        stage: formData.stage,
        industry: formData.industry,
        teamSize: formData.teamSize,
        fundingRaised: formData.fundingRaised,
        fundingStage: formData.fundingStage,
        problemStatement: formData.problemStatement,
        solution: formData.solution,
        targetMarket: formData.targetMarket,
        businessModel: formData.businessModel,
        competitiveAdvantage: formData.competitiveAdvantage,
        teamMembers: teamMembers.filter(m => m.name && m.role),
        investors: investors.filter(i => i.name),
        milestones: milestones.filter(m => m.title),
        lookingFor,
      });
      router.push('/dashboard/founder/startup');
    } catch (error) {
      console.error('Error updating startup profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/founder/startup">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Edit Startup Profile</h1>
            <p className="text-charcoal-600">Update your startup information and pitch</p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Logo Upload */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Startup Logo</h2>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback>{formData.name?.[0] || 'S'}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Logo
                </Button>
                <p className="text-xs text-charcoal-500 mt-2">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </Card>

          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Startup Name *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your startup name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tagline</label>
                  <Input
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                    placeholder="Short and catchy description"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell the story of your startup, the problem you're solving, and your vision..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <Input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.yourstartup.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Founded Date</label>
                  <Input
                    type="date"
                    name="foundedDate"
                    value={formData.foundedDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="fintech">FinTech</option>
                    <option value="healthtech">HealthTech</option>
                    <option value="edtech">EdTech</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="ai-ml">AI/ML</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Startup Stage */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Startup Stage</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="idea">Idea Stage</option>
                    <option value="mvp">Building MVP</option>
                    <option value="launched">Launched</option>
                    <option value="early-traction">Early Traction</option>
                    <option value="growth">Growth</option>
                    <option value="scaling">Scaling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Team Size</label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="1">Solo Founder</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-20">11-20 people</option>
                    <option value="21-50">21-50 people</option>
                    <option value="50+">50+ people</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Funding Raised</label>
                  <Input
                    name="fundingRaised"
                    value={formData.fundingRaised}
                    onChange={handleInputChange}
                    placeholder="e.g., ₹50L, $1M"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Funding Stage</label>
                  <select
                    name="fundingStage"
                    value={formData.fundingStage}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="">Select Stage</option>
                    <option value="bootstrapped">Bootstrapped</option>
                    <option value="pre-seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A</option>
                    <option value="series-b">Series B</option>
                    <option value="series-c+">Series C+</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Problem & Solution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Problem & Solution</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Problem Statement</label>
                <Textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  placeholder="What problem are you solving?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Solution</label>
                <Textarea
                  name="solution"
                  value={formData.solution}
                  onChange={handleInputChange}
                  placeholder="How does your product solve this problem?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Market</label>
                <Textarea
                  name="targetMarket"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                  placeholder="Who are your customers? What's the market size?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Business Model</label>
                <Textarea
                  name="businessModel"
                  value={formData.businessModel}
                  onChange={handleInputChange}
                  placeholder="How do you make money?"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Competitive Advantage</label>
                <Textarea
                  name="competitiveAdvantage"
                  value={formData.competitiveAdvantage}
                  onChange={handleInputChange}
                  placeholder="What makes you different from competitors?"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Team Members */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTeamMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>

            {teamMembers.map((member, index) => (
              <Card key={index} className="p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Team Member {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTeamMember(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={member.role}
                      onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="LinkedIn Profile (Optional)"
                    value={member.linkedin || ''}
                    onChange={(e) => handleTeamMemberChange(index, 'linkedin', e.target.value)}
                  />
                  <Textarea
                    placeholder="Brief bio (Optional)"
                    value={member.bio || ''}
                    onChange={(e) => handleTeamMemberChange(index, 'bio', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}

            {teamMembers.length === 0 && (
              <p className="text-charcoal-500 text-center py-4">No team members added yet</p>
            )}
          </Card>

          {/* Investors */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Investors</h2>
              <Button type="button" variant="outline" size="sm" onClick={handleAddInvestor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Investor
              </Button>
            </div>

            {investors.map((investor, index) => (
              <Card key={index} className="p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Investor {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInvestor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Investor/Angel/VC Name"
                      value={investor.name}
                      onChange={(e) => handleInvestorChange(index, 'name', e.target.value)}
                    />
                    <select
                      value={investor.type}
                      onChange={(e) => handleInvestorChange(index, 'type', e.target.value as any)}
                      className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
                    >
                      <option value="angel">Angel Investor</option>
                      <option value="vc">VC Firm</option>
                      <option value="accelerator">Accelerator</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Investment Amount (Optional)"
                      value={investor.amount || ''}
                      onChange={(e) => handleInvestorChange(index, 'amount', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Investment Date"
                      value={investor.date || ''}
                      onChange={(e) => handleInvestorChange(index, 'date', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {investors.length === 0 && (
              <p className="text-charcoal-500 text-center py-4">No investors added yet</p>
            )}
          </Card>

          {/* Milestones */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Milestones</h2>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {milestones.map((milestone, index) => (
              <Card key={index} className="p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Milestone {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMilestone(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Milestone Title"
                    value={milestone.title}
                    onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      placeholder="Achievement Date"
                      value={milestone.date}
                      onChange={(e) => handleMilestoneChange(index, 'date', e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Description"
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </Card>
            ))}

            {milestones.length === 0 && (
              <p className="text-charcoal-500 text-center py-4">No milestones added yet</p>
            )}
          </Card>

          {/* Looking For */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">What are you looking for?</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {lookingFor.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLookingFor(item)}
                    className="hover:text-primary-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newLookingFor}
                onChange={(e) => setNewLookingFor(e.target.value)}
                placeholder="e.g., CTO, Marketing Lead, Advisor"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLookingFor())}
              />
              <Button type="button" onClick={handleAddLookingFor}>
                Add
              </Button>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/founder/startup')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
