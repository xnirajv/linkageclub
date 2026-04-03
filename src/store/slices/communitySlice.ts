import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, Comment } from '@/types/community';

interface CommunityState {
  posts: Post[];
  currentPost: Post | null;
  comments: Comment[];
  filters: {
    type?: string;
    category?: string;
    tag?: string;
    sort?: 'latest' | 'popular' | 'trending';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  categories: any[];
  tags: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  posts: [],
  currentPost: null,
  comments: [],
  filters: {
    sort: 'latest',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  categories: [],
  tags: [],
  isLoading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async (params: any, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/community/posts?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'community/fetchPostById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/community/posts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async (postData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'community/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to like post');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const savePost = createAsyncThunk(
  'community/savePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/community/posts/${postId}/save`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to save post');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'community/addComment',
  async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, parentId, content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'community/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/community/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTags = createAsyncThunk(
  'community/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/community/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CommunityState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { sort: 'latest' };
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch post by id
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload.post;
        state.comments = action.payload.comments;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload.post);
      })
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked, likes } = action.payload;
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          post.likes = likes;
          post.isLiked = liked;
        }
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.likes = likes;
          state.currentPost.isLiked = liked;
        }
      })
      // Save post
      .addCase(savePost.fulfilled, (state, action) => {
        const { postId, saved, saves } = action.payload;
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          post.saves = saves;
          post.isSaved = saved;
        }
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.saves = saves;
          state.currentPost.isSaved = saved;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload.comment);
        if (state.currentPost) {
          state.currentPost.comments += 1;
        }
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      })
      // Fetch tags
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload.tags;
      });
  },
});

export const { setFilters, clearFilters, setPage, clearCurrentPost } = communitySlice.actions;

export default communitySlice.reducer;
