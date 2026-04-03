'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import {
  Save,
  Upload,
  Mail,
  Eye,
  EyeOff,
  Key,
  MessageSquare,
} from 'lucide-react';
import DashboardLayout from '../../layout';
import { Switch } from '@/components/ui/switch'; // Fix: lowercase 's'

export default function FounderSettingsPage() {
  const { profile, uploadAvatar } = useProfile();
  // ❌ Remove this line - yeh unused aur galat hai
  // const [] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    startupName: profile?.startupName || '',
    startupStage: profile?.startupStage || 'idea',
    industry: profile?.industry || '',
    website: profile?.website || '',
    linkedin: profile?.socialLinks?.linkedin || '',
    github: profile?.socialLinks?.github || '',
    twitter: profile?.socialLinks?.twitter || '',
  });

  // Startup details
  const [startupDetails, setStartupDetails] = useState({
    problemStatement: profile?.problemStatement || '',
    solution: profile?.solution || '',
    targetMarket: profile?.targetMarket || '',
    businessModel: profile?.businessModel || '',
    competitiveAdvantage: profile?.competitiveAdvantage || '',
    fundingRaised: profile?.fundingRaised || '',
    teamSize: profile?.teamSize || '1',
    lookingFor: profile?.lookingFor || ['Co-founder', 'Tech Team', 'Advisors'],
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    matchAlerts: true,
    messageAlerts: true,
    investorAlerts: true,
    marketingEmails: false,
    weeklyDigest: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStartupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStartupDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleSaveNotifications = () => {
    console.log('Saving notification settings:', notificationSettings);
    // API call to save settings
  };

  const handleSaveSecurity = () => {
    console.log('Saving security settings:', securitySettings);
    // API call to save settings
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log('Changing password');
    // API call to change password
  };

  // Notification toggle handlers
  const handleNotificationChange = (key: keyof typeof notificationSettings, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: checked }));
  };

  // Security toggle handlers
  const handleSecurityChange = (key: keyof typeof securitySettings, value: boolean | string) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-950">Founder Settings</h1>
          <p className="text-charcoal-600">Manage your profile and startup preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="startup">Startup</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Avatar Upload */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback>{profileForm.name?.[0] || 'F'}</AvatarFallback>
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
                    Upload New Photo
                  </Button>
                  <p className="text-xs text-charcoal-500 mt-2">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>
              </div>
            </Card>

            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      id="name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      id="location"
                      name="location"
                      value={profileForm.location}
                      onChange={handleProfileChange}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    placeholder="Tell us about yourself and your entrepreneurial journey..."
                  />
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Social Links</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium mb-1">LinkedIn</label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={profileForm.linkedin}
                    onChange={handleProfileChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label htmlFor="github" className="block text-sm font-medium mb-1">GitHub</label>
                  <Input
                    id="github"
                    name="github"
                    value={profileForm.github}
                    onChange={handleProfileChange}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium mb-1">Twitter</label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={profileForm.twitter}
                    onChange={handleProfileChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="startup" className="space-y-6 mt-6">
            {/* Startup Basics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Startup Basics</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startupName" className="block text-sm font-medium mb-1">Startup Name</label>
                    <Input
                      id="startupName"
                      name="startupName"
                      value={profileForm.startupName}
                      onChange={handleProfileChange}
                      placeholder="Your startup name"
                    />
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium mb-1">Industry</label>
                    <select
                      id="industry"
                      name="industry"
                      value={profileForm.industry}
                      onChange={handleProfileChange}
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
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startupStage" className="block text-sm font-medium mb-1">Stage</label>
                    <select
                      id="startupStage"
                      name="startupStage"
                      value={profileForm.startupStage}
                      onChange={handleProfileChange}
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
                    <label htmlFor="website" className="block text-sm font-medium mb-1">Website</label>
                    <Input
                      id="website"
                      name="website"
                      value={profileForm.website}
                      onChange={handleProfileChange}
                      placeholder="https://www.yourstartup.com"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Problem & Solution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Problem & Solution</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="problemStatement" className="block text-sm font-medium mb-1">Problem Statement</label>
                  <Textarea
                    id="problemStatement"
                    name="problemStatement"
                    value={startupDetails.problemStatement}
                    onChange={handleStartupChange}
                    placeholder="What problem are you solving?"
                    rows={3}
                  />
                </div>
                <div>
                  <label htmlFor="solution" className="block text-sm font-medium mb-1">Solution</label>
                  <Textarea
                    id="solution"
                    name="solution"
                    value={startupDetails.solution}
                    onChange={handleStartupChange}
                    placeholder="How does your product solve this problem?"
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Market & Business Model */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Market & Business Model</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="targetMarket" className="block text-sm font-medium mb-1">Target Market</label>
                  <Textarea
                    id="targetMarket"
                    name="targetMarket"
                    value={startupDetails.targetMarket}
                    onChange={handleStartupChange}
                    placeholder="Who are your customers? What's the market size?"
                    rows={2}
                  />
                </div>
                <div>
                  <label htmlFor="businessModel" className="block text-sm font-medium mb-1">Business Model</label>
                  <Textarea
                    id="businessModel"
                    name="businessModel"
                    value={startupDetails.businessModel}
                    onChange={handleStartupChange}
                    placeholder="How do you make money?"
                    rows={2}
                  />
                </div>
                <div>
                  <label htmlFor="competitiveAdvantage" className="block text-sm font-medium mb-1">Competitive Advantage</label>
                  <Textarea
                    id="competitiveAdvantage"
                    name="competitiveAdvantage"
                    value={startupDetails.competitiveAdvantage}
                    onChange={handleStartupChange}
                    placeholder="What makes you different from competitors?"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            {/* Funding & Team */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Funding & Team</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fundingRaised" className="block text-sm font-medium mb-1">Funding Raised</label>
                    <Input
                      id="fundingRaised"
                      name="fundingRaised"
                      value={startupDetails.fundingRaised}
                      onChange={handleStartupChange}
                      placeholder="e.g., ₹50L, $1M"
                    />
                  </div>
                  <div>
                    <label htmlFor="teamSize" className="block text-sm font-medium mb-1">Team Size</label>
                    <select
                      id="teamSize"
                      name="teamSize"
                      value={startupDetails.teamSize}
                      onChange={handleStartupChange}
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
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-charcoal-400" />
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-charcoal-500">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-charcoal-400" />
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-charcoal-500">Receive notifications in browser</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Match Alerts</p>
                        <p className="text-sm text-charcoal-500">When new co-founder matches are found</p>
                      </div>
                      <Switch
                        checked={notificationSettings.matchAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('matchAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Message Alerts</p>
                        <p className="text-sm text-charcoal-500">When you receive new messages</p>
                      </div>
                      <Switch
                        checked={notificationSettings.messageAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('messageAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Investor Alerts</p>
                        <p className="text-sm text-charcoal-500">When investors show interest</p>
                      </div>
                      <Switch
                        checked={notificationSettings.investorAlerts}
                        onCheckedChange={(checked) => handleNotificationChange('investorAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-charcoal-500">Promotions, newsletters, and updates</p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Digest</p>
                        <p className="text-sm text-charcoal-500">Weekly summary of your activity</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyDigest}
                        onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveNotifications}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              
              <div className="space-y-6">
                {/* Password Change */}
                <div>
                  <h4 className="font-medium mb-3">Change Password</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Current Password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                    <Button onClick={handleChangePassword} variant="outline">
                      <Key className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-charcoal-500">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSecurityChange('twoFactorAuth', checked)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Login Alerts</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email me when a new device logs in</p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => handleSecurityChange('loginAlerts', checked)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Session Timeout</h4>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                    className="rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveSecurity}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}