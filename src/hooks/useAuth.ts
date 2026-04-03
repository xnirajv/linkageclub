import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { User } from '@/types/user';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = !!session;
  const isLoading = status === 'loading';
  const user = session?.user as
    | ({
        id: string;
        email: string;
        name: string;
        role: User['role'];
        image?: string;
        trustScore: number;
      } & Partial<User>)
    | undefined;

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'An error occurred during login' };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push('/');
  }, [router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
