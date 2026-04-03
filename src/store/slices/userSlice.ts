import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Skill, Badge, UserPreferences } from '@/types/user';

interface UserState {
  user: User | null;
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  trustScore: number;
  skills: Skill[];
  badges: Badge[];
  settings: UserPreferences;
}

const initialState: UserState = {
  user: null,
  profile: null,
  isLoading: false,
  error: null,
  trustScore: 0,
  skills: [],
  badges: [],
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    newsletter: false,
    theme: 'system',
  },
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTrustScore = createAsyncThunk(
  'user/fetchTrustScore',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/ai/trust-score');
      if (!response.ok) throw new Error('Failed to fetch trust score');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setSettings: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    addSkill: (state, action: PayloadAction<Skill>) => {
      state.skills.push(action.payload);
    },
    removeSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter(s => s.name !== action.payload);
    },
    addBadge: (state, action: PayloadAction<Badge>) => {
      state.badges.push(action.payload);
    },
    clearUser: (state) => {
      state.user = null;
      state.profile = null;
      state.skills = [];
      state.badges = [];
      state.trustScore = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.profile = action.payload.user;
        state.skills = action.payload.user?.skills || [];
        state.badges = action.payload.user?.badges || [];
        state.trustScore = action.payload.user?.trustScore || 0;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.profile = action.payload.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch trust score
      .addCase(fetchTrustScore.fulfilled, (state, action) => {
        state.trustScore = action.payload.trustScore;
      });
  },
});

export const {
  setUser,
  setSettings,
  addSkill,
  removeSkill,
  addBadge,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
