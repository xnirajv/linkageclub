'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Camera } from 'lucide-react';

export function ProfileSettings() {
  const { user } = useAuth();
  const { updateProfile, isUpdating } = useProfile();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    linkedin: user?.socialLinks?.linkedin || '',
    github: user?.socialLinks?.github || '',
    portfolio: user?.socialLinks?.portfolio || '',
  });

  const handleSave = async () => {
    await updateProfile({
      name: form.name,
      bio: form.bio,
      location: form.location,
      phone: form.phone,
      socialLinks: {
        linkedin: form.linkedin,
        github: form.github,
        portfolio: form.portfolio,
      },
    });
  };

  const field = (key: keyof typeof form, label: string, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        placeholder={placeholder || label}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile Picture</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xl">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                <Camera className="h-3.5 w-3.5 text-white" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {field('name', 'Full Name')}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[100px]"
              placeholder="Tell others about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          {field('location', 'Location', 'City, State, Country')}
          {field('phone', 'Phone Number', '+91 XXXXX XXXXX')}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {field('linkedin', 'LinkedIn URL', 'https://linkedin.com/in/...')}
          {field('github', 'GitHub URL', 'https://github.com/...')}
          {field('portfolio', 'Portfolio URL', 'https://...')}
        </CardContent>
      </Card>

      <Button onClick={handleSave} isLoading={isUpdating}>Save Profile</Button>
    </div>
  );
}
