import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import jobReducer from './slices/jobSlice';
import mentorReducer from './slices/mentorSlice';
import assessmentReducer from './slices/assessmentSlice';
import communityReducer from './slices/communitySlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    projects: projectReducer,
    jobs: jobReducer,
    mentors: mentorReducer,
    assessments: assessmentReducer,
    community: communityReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.date', 'payload.createdAt'],
        // Ignore these paths in the state
        ignoredPaths: [
          'user.user.createdAt',
          'user.user.updatedAt',
          'projects.projects.createdAt',
          'jobs.jobs.postedAt',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;