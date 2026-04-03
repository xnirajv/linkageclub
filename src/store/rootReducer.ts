import { combineReducers } from '@reduxjs/toolkit';
import type { Application } from '@/types/application';
import type { Payment } from '@/types/payment';
import userReducer from './slices/userSlice';
import projectReducer from './slices/projectSlice';
import jobReducer from './slices/jobSlice';
import mentorReducer from './slices/mentorSlice';
import assessmentReducer from './slices/assessmentSlice';
import communityReducer from './slices/communitySlice';
import notificationReducer from './slices/notificationSlice';
import applicationReducer from './slices/applicationSlice';
import paymentReducer from './slices/paymentSlice';
import uiReducer from './slices/uiSlice';

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  projects: projectReducer,
  jobs: jobReducer,
  mentors: mentorReducer,
  assessments: assessmentReducer,
  community: communityReducer,
  notifications: notificationReducer,
  applications: applicationReducer,
  payments: paymentReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

// Selector utilities
export const createSelector = <TSelected>(
  selector: (state: RootState) => TSelected
) => selector;

// Common selectors
export const selectUser = (state: RootState) => state.user.user;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserSkills = (state: RootState) => state.user.skills;
export const selectUserBadges = (state: RootState) => state.user.badges;
export const selectUserTrustScore = (state: RootState) => state.user.trustScore;
export const selectUserIsLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;

export const selectProjects = (state: RootState) => state.projects.projects;
export const selectCurrentProject = (state: RootState) => state.projects.currentProject;
export const selectProjectFilters = (state: RootState) => state.projects.filters;
export const selectProjectPagination = (state: RootState) => state.projects.pagination;
export const selectProjectsIsLoading = (state: RootState) => state.projects.isLoading;
export const selectProjectsError = (state: RootState) => state.projects.error;

export const selectJobs = (state: RootState) => state.jobs.jobs;
export const selectCurrentJob = (state: RootState) => state.jobs.currentJob;
export const selectJobFilters = (state: RootState) => state.jobs.filters;
export const selectJobPagination = (state: RootState) => state.jobs.pagination;
export const selectSavedJobs = (state: RootState) => state.jobs.savedJobs;
export const selectJobsIsLoading = (state: RootState) => state.jobs.isLoading;
export const selectJobsError = (state: RootState) => state.jobs.error;

export const selectMentors = (state: RootState) => state.mentors.mentors;
export const selectCurrentMentor = (state: RootState) => state.mentors.currentMentor;
export const selectMentorFilters = (state: RootState) => state.mentors.filters;
export const selectMentorPagination = (state: RootState) => state.mentors.pagination;
export const selectMentorSessions = (state: RootState) => state.mentors.sessions;
export const selectMentorsIsLoading = (state: RootState) => state.mentors.isLoading;
export const selectMentorsError = (state: RootState) => state.mentors.error;

export const selectAssessments = (state: RootState) => state.assessments.assessments;
export const selectCurrentAssessment = (state: RootState) => state.assessments.currentAssessment;
export const selectCurrentAttempt = (state: RootState) => state.assessments.currentAttempt;
export const selectAssessmentResults = (state: RootState) => state.assessments.results;
export const selectAssessmentFilters = (state: RootState) => state.assessments.filters;
export const selectAssessmentPagination = (state: RootState) => state.assessments.pagination;
export const selectUserAssessments = (state: RootState) => state.assessments.userAssessments;
export const selectUserBadgesStore = (state: RootState) => state.assessments.userBadges;
export const selectAssessmentsIsLoading = (state: RootState) => state.assessments.isLoading;
export const selectAssessmentsError = (state: RootState) => state.assessments.error;

export const selectPosts = (state: RootState) => state.community.posts;
export const selectCurrentPost = (state: RootState) => state.community.currentPost;
export const selectComments = (state: RootState) => state.community.comments;
export const selectCommunityFilters = (state: RootState) => state.community.filters;
export const selectCommunityPagination = (state: RootState) => state.community.pagination;
export const selectCategories = (state: RootState) => state.community.categories;
export const selectTags = (state: RootState) => state.community.tags;
export const selectCommunityIsLoading = (state: RootState) => state.community.isLoading;
export const selectCommunityError = (state: RootState) => state.community.error;

export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationPagination = (state: RootState) => state.notifications.pagination;
export const selectNotificationPreferences = (state: RootState) => state.notifications.preferences;
export const selectNotificationsIsLoading = (state: RootState) => state.notifications.isLoading;
export const selectNotificationsError = (state: RootState) => state.notifications.error;

export const selectApplications = (state: RootState) => state.applications.applications;
export const selectCurrentApplication = (state: RootState) => state.applications.currentApplication;
export const selectApplicationFilters = (state: RootState) => state.applications.filters;
export const selectApplicationPagination = (state: RootState) => state.applications.pagination;
export const selectApplicationsIsLoading = (state: RootState) => state.applications.isLoading;
export const selectApplicationsError = (state: RootState) => state.applications.error;

export const selectTransactions = (state: RootState) => state.payments.transactions;
export const selectCurrentTransaction = (state: RootState) => state.payments.currentTransaction;
export const selectBalance = (state: RootState) => state.payments.balance;
export const selectPaymentSummary = (state: RootState) => state.payments.summary;
export const selectPaymentPagination = (state: RootState) => state.payments.pagination;
export const selectPaymentsIsLoading = (state: RootState) => state.payments.isLoading;
export const selectPaymentsError = (state: RootState) => state.payments.error;

export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state: RootState) => state.ui.mobileMenuOpen;
export const selectModalState = (modalName: string) => (state: RootState) => state.ui.modals[modalName];
export const selectToasts = (state: RootState) => state.ui.toasts;
export const selectLoading = (key: string) => (state: RootState) => state.ui.loading[key];

// Composite selectors
export const selectUserWithProfile = (state: RootState) => ({
  user: selectUser(state),
  profile: selectUserProfile(state),
  skills: selectUserSkills(state),
  badges: selectUserBadges(state),
  trustScore: selectUserTrustScore(state),
});

export const selectProjectWithCompany = (state: RootState, projectId: string) => {
  const project = selectProjects(state).find(p => p._id === projectId);
  return project;
};

export const selectJobWithCompany = (state: RootState, jobId: string) => {
  const job = selectJobs(state).find(j => j._id === jobId);
  return job;
};

export const selectMentorWithUser = (state: RootState, mentorId: string) => {
  const mentor = selectMentors(state).find(m => m._id === mentorId);
  return mentor;
};

export const selectAssessmentWithAttempt = (state: RootState, assessmentId: string) => {
  const assessment = selectAssessments(state).find(a => a._id === assessmentId);
  return assessment;
};

export const selectPostWithAuthor = (state: RootState, postId: string) => {
  const post = selectPosts(state).find(p => p._id === postId);
  return post;
};

export const selectNotificationStats = (state: RootState) => ({
  total: selectNotifications(state).length,
  unread: selectUnreadCount(state),
  read: selectNotifications(state).length - selectUnreadCount(state),
});

export const selectApplicationStats = (state: RootState) => {
  const apps = selectApplications(state) as Application[];
  return {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    shortlisted: apps.filter(a => a.status === 'shortlisted').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };
};

export const selectPaymentStats = (state: RootState) => {
  const txns = selectTransactions(state) as Payment[];
  return {
    total: txns.length,
    completed: txns.filter(t => t.status === 'completed').length,
    pending: txns.filter(t => t.status === 'pending').length,
    failed: txns.filter(t => t.status === 'failed').length,
    totalAmount: txns.reduce((sum, t) => sum + t.amount, 0),
  };
};

export const selectUiState = (state: RootState) => ({
  theme: selectTheme(state),
  sidebarOpen: selectSidebarOpen(state),
  mobileMenuOpen: selectMobileMenuOpen(state),
  toasts: selectToasts(state),
});

// Memoized selectors (for use with createSelector from reselect)
import { createSelector as createReselectSelector } from '@reduxjs/toolkit';

export const selectProjectsByCategory = createReselectSelector(
  [selectProjects, (state: RootState, category: string) => category],
  (projects, category) => projects.filter(p => p.category === category)
);

export const selectProjectsByStatus = createReselectSelector(
  [selectProjects, (state: RootState, status: string) => status],
  (projects, status) => projects.filter(p => p.status === status)
);

export const selectJobsByType = createReselectSelector(
  [selectJobs, (state: RootState, type: string) => type],
  (jobs, type) => jobs.filter(j => j.type === type)
);

export const selectJobsByLocation = createReselectSelector(
  [selectJobs, (state: RootState, location: string) => location],
  (jobs, location) => jobs.filter(j => j.location?.toLowerCase().includes(location.toLowerCase()))
);

export const selectMentorsByExpertise = createReselectSelector(
  [selectMentors, (state: RootState, skill: string) => skill],
  (mentors, skill) => mentors.filter(m => 
    m.expertise?.some(e => e.skill.toLowerCase().includes(skill.toLowerCase()))
  )
);

export const selectAssessmentsByLevel = createReselectSelector(
  [selectAssessments, (state: RootState, level: string) => level],
  (assessments, level) => assessments.filter(a => a.level === level)
);

export const selectPostsByType = createReselectSelector(
  [selectPosts, (state: RootState, type: string) => type],
  (posts, type) => posts.filter(p => p.type === type)
);

export const selectPostsByTag = createReselectSelector(
  [selectPosts, (state: RootState, tag: string) => tag],
  (posts, tag) => posts.filter(p => p.tags?.includes(tag))
);
