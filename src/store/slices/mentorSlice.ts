import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Mentor } from '@/types/mentor';

interface MentorState {
  mentors: Mentor[];
  currentMentor: Mentor | null;
  filters: {
    expertise: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    availability?: string;
    search?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  sessions: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MentorState = {
  mentors: [],
  currentMentor: null,
  filters: {
    expertise: [],
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  sessions: [],
  isLoading: false,
  error: null,
};

export const fetchMentors = createAsyncThunk(
  'mentors/fetchAll',
  async (params: any, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(`/api/mentors?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch mentors');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMentorById = createAsyncThunk(
  'mentors/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/mentors/${id}`);
      if (!response.ok) throw new Error('Failed to fetch mentor');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMentorSessions = createAsyncThunk(
  'mentors/fetchSessions',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/mentors/${id}/sessions`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const bookSession = createAsyncThunk(
  'mentors/bookSession',
  async ({ mentorId, sessionData }: { mentorId: string; sessionData: any }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/mentors/${mentorId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error('Failed to book session');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const mentorSlice = createSlice({
  name: 'mentors',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<MentorState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = { expertise: [] };
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    clearCurrentMentor: (state) => {
      state.currentMentor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch mentors
      .addCase(fetchMentors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentors = action.payload.mentors;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch mentor by id
      .addCase(fetchMentorById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMentorById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMentor = action.payload.mentor;
      })
      .addCase(fetchMentorById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch mentor sessions
      .addCase(fetchMentorSessions.fulfilled, (state, action) => {
        state.sessions = action.payload.sessions;
      })
      // Book session
      .addCase(bookSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload.session);
      });
  },
});

export const { setFilters, clearFilters, setPage, clearCurrentMentor } = mentorSlice.actions;

export default mentorSlice.reducer;