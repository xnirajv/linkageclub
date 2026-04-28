import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Project } from '@/types/project';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  filters: {
    category?: string;
    skills: string[];
    minBudget?: number;
    maxBudget?: number;
    experienceLevel?: string;
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  filters: { skills: [] },
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const response = await fetch(`/api/projects?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update project');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProjectState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { skills: [] };
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data?.projects || action.payload.projects || [];
        state.pagination = action.payload.data?.pagination || action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload.data?.project || action.payload.project || null;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        const project = action.payload.data?.project || action.payload.project;
        if (project) state.projects.unshift(project);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const project = action.payload.data?.project || action.payload.project;
        if (project) {
          const index = state.projects.findIndex((p) => p._id === project._id);
          if (index !== -1) state.projects[index] = project;
          if (state.currentProject?._id === project._id) state.currentProject = project;
        }
      });
  },
});

export const { setFilters, clearFilters, setPage, clearCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;