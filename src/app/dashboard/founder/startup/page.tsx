'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Edit, Save, Upload, Globe, MapPin, Users, Calendar, DollarSign, FileText } from 'lucide-react';
import DashboardLayout from '../../layout';

export default function StartupProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [startupData, setStartupData] = useState({
    name: 'TechStart',
    description: 'Building the future of AI-powered education',
    stage: 'Seed',
    industry: 'EdTech',
    foundedDate: '2024-01-01',
    location: 'Bengaluru',
    website: 'https://techstart.com',
    teamSize: '4',
    fundingRaised: '₹50L',
    lookingFor: ['Co-founder', 'Tech Team', 'Advisors'],
    pitchDeck: '/files/pitch-deck.pdf',
  });

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
              Startup Profile
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Showcase your startup to potential co-founders and investors
            </p>
          </div>
          <Button
            variant={isEditing ? 'default' : 'outline'}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Logo Upload */}
        <Card className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
              TS
            </div>
            {isEditing && (
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
            )}
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Startup Name</label>
                {isEditing ? (
                  <Input
                    value={startupData.name}
                    onChange={(e) => setStartupData({ ...startupData, name: e.target.value })}
                  />
                ) : (
                  <p className="text-charcoal-950">{startupData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                {isEditing ? (
                  <select
                    value={startupData.industry}
                    onChange={(e) => setStartupData({ ...startupData, industry: e.target.value })}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="EdTech">EdTech</option>
                    <option value="FinTech">FinTech</option>
                    <option value="HealthTech">HealthTech</option>
                    <option value="SaaS">SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                ) : (
                  <p className="text-charcoal-950">{startupData.industry}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              {isEditing ? (
                <Textarea
                  value={startupData.description}
                  onChange={(e) => setStartupData({ ...startupData, description: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="text-charcoal-600">{startupData.description}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Startup Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-charcoal-400 mt-0.5" />
              <div>
                <p className="text-sm text-charcoal-500">Founded</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={startupData.foundedDate}
                    onChange={(e) => setStartupData({ ...startupData, foundedDate: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{new Date(startupData.foundedDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-charcoal-400 mt-0.5" />
              <div>
                <p className="text-sm text-charcoal-500">Location</p>
                {isEditing ? (
                  <Input
                    value={startupData.location}
                    onChange={(e) => setStartupData({ ...startupData, location: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{startupData.location}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-charcoal-400 mt-0.5" />
              <div>
                <p className="text-sm text-charcoal-500">Website</p>
                {isEditing ? (
                  <Input
                    value={startupData.website}
                    onChange={(e) => setStartupData({ ...startupData, website: e.target.value })}
                  />
                ) : (
                  <a href={startupData.website} className="text-primary-600 hover:underline" target="_blank">
                    {startupData.website}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-charcoal-400 mt-0.5" />
              <div>
                <p className="text-sm text-charcoal-500">Team Size</p>
                {isEditing ? (
                  <Input
                    type="number"
                    value={startupData.teamSize}
                    onChange={(e) => setStartupData({ ...startupData, teamSize: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{startupData.teamSize} people</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-charcoal-400 mt-0.5" />
              <div>
                <p className="text-sm text-charcoal-500">Funding Raised</p>
                {isEditing ? (
                  <Input
                    value={startupData.fundingRaised}
                    onChange={(e) => setStartupData({ ...startupData, fundingRaised: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{startupData.fundingRaised}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm text-charcoal-500">Stage</p>
                {isEditing ? (
                  <select
                    value={startupData.stage}
                    onChange={(e) => setStartupData({ ...startupData, stage: e.target.value })}
                    className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="Idea">Idea</option>
                    <option value="MVP">MVP</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Growth">Growth</option>
                  </select>
                ) : (
                  <p className="font-medium">{startupData.stage}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Looking For */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Looking For</h2>
          <div className="flex flex-wrap gap-2">
            {startupData.lookingFor.map((item) => (
              <Badge key={item} variant="skill" size="lg">
                {item}
              </Badge>
            ))}
          </div>
          {isEditing && (
            <div className="mt-4">
              <Input placeholder="Add new requirement..." />
            </div>
          )}
        </Card>

        {/* Pitch Deck */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Pitch Deck</h2>
          {startupData.pitchDeck ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">Pitch Deck.pdf</p>
                  <p className="text-sm text-charcoal-500">Uploaded on Jan 15, 2024</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={startupData.pitchDeck} download>Download</a>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <FileText className="h-8 w-8 text-charcoal-400 mx-auto mb-2" />
              <p className="text-charcoal-500">No pitch deck uploaded yet</p>
              {isEditing && (
                <Button variant="outline" className="mt-4">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Pitch Deck
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}