'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export function AccountSettings() {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) return;
    setIsChangingPassword(true);
    try {
      await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-muted"
              value={user?.email || ''}
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              {user?.emailVerified ? '✓ Verified' : '⚠ Not verified'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-muted capitalize"
              value={user?.role || ''}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Member Since</label>
            <input
              className="w-full border rounded-md px-3 py-2 text-sm bg-muted"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            onClick={handlePasswordChange}
            isLoading={isChangingPassword}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error-200">
        <CardHeader><CardTitle className="text-error-600">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" isLoading={isDeletingAccount}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
