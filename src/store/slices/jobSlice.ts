import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '@/types/job';

interface JobState {
  jobs: Job[];
  currentJob: Job | null;
  filters: {
    type: string[];
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    experience?: string;
    skills: string[];
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  savedJobs: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: JobState = {
  jobs: [],
  currentJob: null,
  filters: {
    type: [],
    skills: [],
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  savedJobs: [],
  isLoading: false,
  error: null,
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/jobs?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch job');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSavedJobs = createAsyncThunk(
  'jobs/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/jobs/saved');
      if (!response.ok) throw new Error('Failed to fetch saved jobs');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveJob = createAsyncThunk(
  'jobs/save',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to save job');
      const data = await response.json();
      return { jobId, saved: data.saved };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<JobState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { type: [], skills: [] };
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.jobs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch job by id
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload.job;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch saved jobs
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.savedJobs = action.payload.jobs.map((j: Job) => j._id);
      })
      // Save/unsave job
      .addCase(saveJob.fulfilled, (state, action) => {
        const { jobId, saved } = action.payload;
        if (saved) {
          if (!state.savedJobs.includes(jobId)) {
            state.savedJobs.push(jobId);
          }
        } else {
          state.savedJobs = state.savedJobs.filter(id => id !== jobId);
        }
      });
  },
});

export const { setFilters, clearFilters, setPage, clearCurrentJob } = jobSlice.actions;

export default jobSlice.reducer;