import useSWR from 'swr';
import { useCallback } from 'react';
import { fetcher } from '@/lib/api/client';
import { useAuth } from './useAuth';
import type { Mentor } from '@/types/mentor';
import type { User } from '@/types/user';

interface ProfileResponse {
  user?: User;
  mentorProfile?: Mentor;
}

export function useProfile() {
  const { user, isAuthenticated } = useAuth();

  const { data, error, mutate } = useSWR<ProfileResponse>(
    isAuthenticated ? '/api/users/profile' : null,
    fetcher
  );

  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      mutate(); // Refresh profile
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/users/profile/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload avatar');

      mutate(); // Refresh profile
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const addSkill = useCallback(async (skill: { name: string; level: string }) => {
    try {
      const response = await fetch('/api/users/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      });

      if (!response.ok) throw new Error('Failed to add skill');

      mutate(); // Refresh profile
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const removeSkill = useCallback(async (skillName: string) => {
    try {
      const response = await fetch(`/api/users/skills?name=${encodeURIComponent(skillName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove skill');

      mutate(); // Refresh profile
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const updateSettings = useCallback(async (settings: any) => {
    try {
      const response = await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      mutate(); // Refresh profile
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const verifyIdentity = useCallback(async (type: string, data?: any) => {
    try {
      const response = await fetch(`/api/users/verify/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) throw new Error(`Failed to verify ${type}`);

      mutate(); // Refresh profile
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  return {
    profile: data?.user,
    mentorProfile: data?.mentorProfile,
    preferences: data?.user?.preferences,
    skills: data?.user?.skills || [],
    badges: data?.user?.badges || [],
    verification: data?.user?.verification,
    isLoading: !error && !data,
    isUpdating: false,
    isError: error,
    updateProfile,
    uploadAvatar,
    addSkill,
    removeSkill,
    updateSettings,
    verifyIdentity,
    mutate,
  };
}

export function usePublicProfile(userId: string) {
  const { data, error } = useSWR<ProfileResponse>(
    userId ? `/api/users/${userId}` : null,
    fetcher
  );

  return {
    profile: data?.user,
    mentorProfile: data?.mentorProfile,
    isLoading: !error && !data,
    isError: error,
  };
}
