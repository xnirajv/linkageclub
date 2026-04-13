'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, Building2, Calendar, Edit, Globe, Instagram, Linkedin, Mail, MapPin, Share2, ShieldCheck, Twitter, Users, Upload, Check, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CompanyProfilePage() {
  const { profile, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState(() => {
    const p = profile as any;
    return {
      companyName: p?.name || 'TechCorp Solutions',
      website: p?.website || 'https://techcorp.com',
      email: p?.email || 'hello@techcorp.com',
      phone: p?.phone || '+91 XXXXX XXXXX',
      location: p?.location || 'Bangalore, India',
      foundedYear: String(p?.foundedYear || '2022'),
      companySize: p?.companySize || '11-50',
      industry: p?.industry || 'Technology',
      bio: p?.bio || 'Building innovative digital products and hiring outcomes.',
      logo: p?.logo || '',
      banner: p?.banner || '',
      twitter: p?.social?.twitter || '',
      linkedin: p?.social?.linkedin || '',
      instagram: p?.social?.instagram || '',
    };
  });

  if (isLoading) {
    return <div className="rounded-[28px] bg-card/80 p-8 text-sm text-charcoal-500 dark:bg-charcoal-900/72 dark:text-charcoal-400">Loading profile...</div>;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-charcoal-950 dark:text-white">Company Profile</h1>
          <p className="mt-2 text-sm leading-7 text-charcoal-500 dark:text-charcoal-400">Manage your company information, branding, and verification status.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.35),_transparent_35%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.95)_60%,_rgba(75,73,69,0.95))] text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-white/20 text-2xl font-semibold">
                {formData.companyName.slice(0, 1)}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </div>
                <h2 className="mt-4 text-3xl font-semibold">{formData.companyName}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">{formData.bio}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Projects', '12'],
                ['Team', formData.companySize],
                ['Trust', '92%'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] bg-black/20 px-4 py-3 text-center">
                  <div className="text-lg font-semibold">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      {isEditing ? (
        <Card className="border-none bg-card/80 shadow-[0_18px_45px_rgba(52,74,134,0.10)] dark:bg-charcoal-900/72">
          <CardHeader>
            <CardTitle className="text-lg">Edit Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
                <TabsTrigger value="social">Social Links</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <Input 
                      value={formData.companyName} 
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input 
                      value={formData.website} 
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input 
                      value={formData.location} 
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Founded Year</label>
                    <Input 
                      value={formData.foundedYear} 
                      onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Size</label>
                    <select 
                      value={formData.companySize} 
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option>1-10</option>
                      <option>11-50</option>
                      <option>51-200</option>
                      <option>200-1000</option>
                      <option>1000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <Input 
                      value={formData.industry} 
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="Technology, Finance, etc."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company Bio</label>
                  <textarea 
                    value={formData.bio} 
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about your company..."
                    rows={4}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </TabsContent>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">Company Logo</label>
                  <div className="rounded-lg border-2 border-dashed border-primary-300 p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-charcoal-400" />
                    <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Click to upload or drag and drop</p>
                    <p className="text-xs text-charcoal-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Banner Image</label>
                  <div className="rounded-lg border-2 border-dashed border-primary-300 p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-charcoal-400" />
                    <p className="text-sm text-charcoal-600 dark:text-charcoal-400">Click to upload or drag and drop</p>
                    <p className="text-xs text-charcoal-500 mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </div>

                <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-800/30 dark:bg-primary-950/20">
                  <p className="text-sm text-primary-900 dark:text-primary-300">Brand colors will be applied to your profile and project pages for a consistent look.</p>
                </div>
              </TabsContent>

              {/* Social Links Tab */}
              <TabsContent value="social" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="flex text-sm font-medium mb-2 items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </label>
                    <Input 
                      value={formData.linkedin} 
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div>
                    <label className="flex text-sm font-medium mb-2 items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter/X Handle
                    </label>
                    <Input 
                      value={formData.twitter} 
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@yourhandle"
                    />
                  </div>
                  <div>
                    <label className="flex text-sm font-medium mb-2 items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram Profile
                    </label>
                    <Input 
                      value={formData.instagram} 
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Verification Tab */}
              <TabsContent value="verification" className="space-y-4">
                <div className="space-y-3">
                  <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-800/30 dark:bg-primary-950/20 flex items-start gap-3">
                    <Check className="h-5 w-5 text-info-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal-900 dark:text-white">Email Verified</p>
                      <p className="text-xs text-charcoal-600 dark:text-charcoal-400 mt-1">hello@techcorp.com</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-charcoal-200 bg-charcoal-50/50 p-4 dark:border-charcoal-800/30 dark:bg-charcoal-950/20 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-charcoal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal-700 dark:text-charcoal-300">Phone Verification</p>
                      <Button size="sm" variant="outline" className="mt-2">Verify Phone</Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-charcoal-200 bg-charcoal-50/50 p-4 dark:border-charcoal-800/30 dark:bg-charcoal-950/20 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-charcoal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal-700 dark:text-charcoal-300">Company Documents</p>
                      <p className="text-xs text-charcoal-600 dark:text-charcoal-400 mt-1">Upload business registration or tax documents</p>
                      <Button size="sm" variant="outline" className="mt-2">Upload Documents</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        /* View Mode */
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Info label="Company Name" value={formData.companyName} icon={<Building2 className="h-4 w-4 text-primary-700" />} />
                <Info label="Website" value={formData.website} value_isLink icon={<Globe className="h-4 w-4 text-info-700" />} />
                <Info label="Email" value={formData.email} icon={<Mail className="h-4 w-4 text-primary-700" />} />
                <Info label="Phone" value={formData.phone} icon={<ShieldCheck className="h-4 w-4 text-charcoal-700" />} />
                <Info label="Location" value={formData.location} icon={<MapPin className="h-4 w-4 text-secondary-700" />} />
                <Info label="Founded" value={formData.foundedYear} icon={<Calendar className="h-4 w-4 text-charcoal-700" />} />
              </CardContent>
            </Card>

            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-lg">About</CardTitle></CardHeader>
              <CardContent className="text-sm leading-7 text-charcoal-700 dark:text-charcoal-300">
                {formData.bio}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-lg">Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Info label="Company Size" value={formData.companySize} icon={<Users className="h-4 w-4 text-info-700" />} />
                <Info label="Industry" value={formData.industry} icon={<Building2 className="h-4 w-4 text-primary-700" />} />
                <Info label="Rating" value="4.8/5" icon={<Award className="h-4 w-4 text-secondary-700" />} />
                <Info label="Trust Score" value="92%" icon={<ShieldCheck className="h-4 w-4 text-charcoal-700" />} />
              </CardContent>
            </Card>

            <Card className="border-none bg-card/80 dark:bg-charcoal-900/72">
              <CardHeader><CardTitle className="text-lg">Social</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {formData.linkedin && <div className="flex items-center gap-2 text-sm"><Linkedin className="h-4 w-4" />{formData.linkedin}</div>}
                {formData.twitter && <div className="flex items-center gap-2 text-sm"><Twitter className="h-4 w-4" />{formData.twitter}</div>}
                {formData.instagram && <div className="flex items-center gap-2 text-sm"><Instagram className="h-4 w-4" />{formData.instagram}</div>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, value_isLink, icon }: { label: string; value: string; value_isLink?: boolean; icon: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-primary-100/70 bg-silver-50/70 p-4 dark:border-white/10 dark:bg-charcoal-950/35">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-charcoal-500 dark:text-charcoal-400">{icon}{label}</div>
      <div className="mt-3 text-sm font-medium text-charcoal-950 dark:text-white break-words">
        {value_isLink ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">{value}</a> : value}
      </div>
    </div>
  );
}
