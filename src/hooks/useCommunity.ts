import useSWR from 'swr';
import { useCallback, useState } from 'react';
import { fetcher } from '@/lib/api/client';
import { useAuth } from './useAuth';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  tag?: string;
  sort?: 'latest' | 'popular' | 'trending';
}

interface PostsResponse {
  posts?: any[];
  pagination?: any;
}

interface PostResponse {
  post?: any;
  comments?: any[];
}

export function usePosts(options: UsePostsOptions = {}) {
  const [filters, setFilters] = useState(options);

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const { data, error, mutate } = useSWR<PostsResponse>(
    `/api/community/posts?${queryParams.toString()}`,
    fetcher
  );

  const createPost = useCallback(async (postData: any) => {
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error('Failed to create post');

      mutate(); // Refresh posts
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const likePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like post');

      mutate(); // Refresh posts
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const savePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/save`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to save post');

      mutate(); // Refresh posts
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const sharePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/share`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to share post');

      mutate(); // Refresh posts
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  const reportPost = useCallback(async (postId: string, reason: string) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to report post');

      return await response.json();
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    posts: data?.posts || [],
    pagination: data?.pagination,
    isLoading: !error && !data,
    isError: error,
    filters,
    createPost,
    likePost,
    savePost,
    sharePost,
    reportPost,
    mutate,
  };
}

export function usePost(id: string) {
  const { data, error, mutate } = useSWR<PostResponse>(
    id ? `/api/community/posts/${id}` : null,
    fetcher
  );

  const addComment = useCallback(async (content: string, parentId?: string) => {
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, parentId, content }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      mutate(); // Refresh post
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [id, mutate]);

  const likeComment = useCallback(async (commentId: string) => {
    try {
      const response = await fetch(`/api/community/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like comment');

      mutate(); // Refresh post
      return await response.json();
    } catch (error) {
      throw error;
    }
  }, [mutate]);

  return {
    post: data?.post,
    comments: data?.comments,
    isLoading: !error && !data,
    isError: error,
    addComment,
    likeComment,
    mutate,
  };
}
