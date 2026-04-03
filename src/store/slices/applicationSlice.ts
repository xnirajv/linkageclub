import { createSlice } from '@reduxjs/toolkit';
import type { Application } from '@/types/application';

interface ApplicationsState {
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

const initialState: ApplicationsState = {
  applications: [],
  currentApplication: null,
  filters: {},
  pagination: null,
  isLoading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
});

export default applicationSlice.reducer;
