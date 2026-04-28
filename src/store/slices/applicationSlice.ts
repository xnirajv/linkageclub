import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Application } from '@/types/application';

interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  filters: Record<string, unknown>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  applications: [],
  currentApplication: null,
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,
};

export const fetchApplications = createAsyncThunk(
  'applications/fetchAll',
  async (params: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
      const response = await fetch(`/api/applications?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchApplicationById = createAsyncThunk(
  'applications/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/applications/${id}`);
      if (!response.ok) throw new Error('Failed to fetch application');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload.data?.applications || action.payload.applications || [];
        state.pagination = action.payload.data?.pagination || action.payload.pagination || null;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchApplicationById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentApplication = action.payload.data?.application || action.payload.application || null;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentApplication, clearError, setFilters } = applicationSlice.actions;
export default applicationSlice.reducer;