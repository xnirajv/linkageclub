import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AssessmentState {
  assessments: any[];
  currentAssessment: any | null;
  currentAttempt: any | null;
  results: any | null;
  filters: {
    skill?: string;
    level?: string;
    price?: string;
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  userAssessments: any[];
  userBadges: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  assessments: [],
  currentAssessment: null,
  currentAttempt: null,
  results: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  userAssessments: [],
  userBadges: [],
  isLoading: false,
  error: null,
};

export const fetchAssessments = createAsyncThunk(
  'assessments/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/assessments?${queryParams}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAssessmentById = createAsyncThunk(
  'assessments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/assessments/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const startAssessment = createAsyncThunk(
  'assessments/start',
  async (
    { id, paymentId }: { id: string; paymentId?: string },
    { rejectWithValue }
  ) => {
    try {
      const url = paymentId
        ? `/api/assessments/${id}/start?paymentId=${paymentId}`
        : `/api/assessments/${id}/start`;

      const response = await fetch(url, { method: 'POST' });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitAssessment = createAsyncThunk(
  'assessments/submit',
  async (
    {
      id,
      answers,
      timeSpent,
    }: { id: string; answers: number[]; timeSpent: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/assessments/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserAssessments = createAsyncThunk(
  'assessments/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/assessments/user');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserBadges = createAsyncThunk(
  'assessments/fetchBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/assessments/user/badges');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<AssessmentState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentAssessment: (state) => {
      state.currentAssessment = null;
    },
    clearAttempt: (state) => {
      state.currentAttempt = null;
    },
    clearResults: (state) => {
      state.results = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assessments
      .addCase(fetchAssessments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessments = action.payload.assessments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single assessment
      .addCase(fetchAssessmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAssessment = action.payload.assessment;
      })
      .addCase(fetchAssessmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Start assessment
      .addCase(startAssessment.fulfilled, (state, action) => {
        state.currentAttempt = action.payload;
      })
      .addCase(startAssessment.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Submit assessment
      .addCase(submitAssessment.fulfilled, (state, action) => {
        state.results = action.payload.results;
        state.currentAttempt = null;
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch user assessments
      .addCase(fetchUserAssessments.fulfilled, (state, action) => {
        state.userAssessments = action.payload.assessments;
      })
      // Fetch user badges
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.userBadges = action.payload.badges;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  clearCurrentAssessment,
  clearAttempt,
  clearResults,
  clearError,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;