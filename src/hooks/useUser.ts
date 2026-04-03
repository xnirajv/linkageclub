import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/api/client';
import { IUser } from '@/types/user';

export interface UseUserReturn {
  user: IUser | null;
  loading: boolean;
  error: Error | null;
  updateUser: (data: Partial<IUser>) => Promise<void>;
  updateSkills: (skills: any[]) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    if (!session?.user?.id) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ user: IUser }>(
        `/api/users/${session.user.id}`
      );

      setUser(response.user);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user');
      setError(error);
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const updateUser = useCallback(
    async (data: Partial<IUser>) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.patch<{ user: IUser }>(
          '/api/users/profile',
          data
        );

        setUser(response.user);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update user');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const updateSkills = useCallback(
    async (skills: any[]) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.put<{ user: IUser }>(
          '/api/users/skills',
          { skills }
        );

        setUser(response.user);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update skills');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateSettings = useCallback(
    async (settings: any) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.put<{ user: IUser }>(
          '/api/users/settings',
          { settings }
        );

        setUser(response.user);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update settings');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUser();
    } else if (status === 'unauthenticated') {
      setUser(null);
      setLoading(false);
    }
  }, [status, fetchUser]);

  return {
    user,
    loading: loading || status === 'loading',
    error,
    updateUser,
    updateSkills,
    updateSettings,
    refreshUser,
  };
}

export default useUser;