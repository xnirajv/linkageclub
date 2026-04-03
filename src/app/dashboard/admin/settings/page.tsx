'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save } from 'lucide-react';
import DashboardLayout from '../../layout';
import { Switch } from '@/components/ui/switch';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'InternHub',
    platformUrl: 'https://internhub.com',
    supportEmail: 'support@internhub.com',
    maintenanceMode: false,
    
    // Feature Toggles
    enableAssessments: true,
    enableProjects: true,
    enableJobs: true,
    enableMentors: true,
    enableCommunity: true,
    enableAIMatching: true,
    
    // Pricing Settings
    platformFee: 10,
    assessmentCommission: 20,
    mentorCommission: 15,
    
    // Email Settings
    welcomeEmail: true,
    applicationEmails: true,
    paymentEmails: true,
    newsletterEnabled: false,
    
    // Security Settings
    requireEmailVerification: true,
    requirePhoneVerification: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    
    // Limits
    maxProjectsPerCompany: 10,
    maxJobsPerCompany: 10,
    maxAssessmentsPerStudent: 50,
    maxFileSize: 10,
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950 dark:text-white">
              Platform Settings
            </h1>
            <p className="text-charcoal-600 dark:text-charcoal-400">
              Configure and manage platform settings
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Platform Name
                  </label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Platform URL
                  </label>
                  <Input
                    value={settings.platformUrl}
                    onChange={(e) => setSettings({ ...settings, platformUrl: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-charcoal-500">
                      Enable maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Feature Toggles</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'enableAssessments', label: 'Skill Assessments' },
                  { key: 'enableProjects', label: 'Projects Marketplace' },
                  { key: 'enableJobs', label: 'Job Listings' },
                  { key: 'enableMentors', label: 'Mentorship Program' },
                  { key: 'enableCommunity', label: 'Community Features' },
                  { key: 'enableAIMatching', label: 'AI-Powered Matching' },
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{feature.label}</p>
                    </div>
                    <Switch
                      checked={settings[feature.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, [feature.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Pricing Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Platform Fee (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.platformFee}
                    onChange={(e) => setSettings({ ...settings, platformFee: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Assessment Commission (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.assessmentCommission}
                    onChange={(e) => setSettings({ ...settings, assessmentCommission: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mentor Commission (%)
                  </label>
                  <Input
                    type="number"
                    value={settings.mentorCommission}
                    onChange={(e) => setSettings({ ...settings, mentorCommission: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Email Settings</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'welcomeEmail', label: 'Welcome Email' },
                  { key: 'applicationEmails', label: 'Application Notifications' },
                  { key: 'paymentEmails', label: 'Payment Confirmations' },
                  { key: 'newsletterEnabled', label: 'Newsletter' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'requireEmailVerification', label: 'Require Email Verification' },
                  { key: 'requirePhoneVerification', label: 'Require Phone Verification' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, [item.key]: checked })
                      }
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Login Attempts
                  </label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="limits">
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-semibold">Platform Limits</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Projects per Company
                  </label>
                  <Input
                    type="number"
                    value={settings.maxProjectsPerCompany}
                    onChange={(e) => setSettings({ ...settings, maxProjectsPerCompany: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Jobs per Company
                  </label>
                  <Input
                    type="number"
                    value={settings.maxJobsPerCompany}
                    onChange={(e) => setSettings({ ...settings, maxJobsPerCompany: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max Assessments per Student
                  </label>
                  <Input
                    type="number"
                    value={settings.maxAssessmentsPerStudent}
                    onChange={(e) => setSettings({ ...settings, maxAssessmentsPerStudent: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Max File Size (MB)
                  </label>
                  <Input
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}