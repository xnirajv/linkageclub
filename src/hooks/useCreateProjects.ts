import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
}

interface Milestone {
  id: string;
  title: string;
  amount: number;
  deadlineDay: number;
  deliverables: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  mimeType: string;
}

interface ProjectFormData {
  title: string;
  category: string;
  description: string;
  summary: string;
  skills: Skill[];
  experienceLevel: string;
  requirements: string[];
  locationType: string;
  location: string;
  budgetType: string;
  budgetMin: string;
  budgetMax: string;
  hourlyRate: string;
  duration: string;
  durationUnit: 'days' | 'weeks';
  milestones: Milestone[];
  visibility: 'public' | 'private' | 'invite';
  attachments: Attachment[];
  isFeatured: boolean;
  termsAccepted: boolean;
}

interface ProjectStore {
  currentStep: number;
  projectId: string | null;
  status: string;
  formData: ProjectFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  lastSavedAt: number | null;
  hasUnsavedChanges: boolean;
  setCurrentStep: (step: number) => void;
  setProjectId: (id: string) => void;
  setStatus: (status: string) => void;
  updateField: <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (index: number) => void;
  updateSkill: (index: number, skill: Partial<Skill>) => void;
  addMilestone: () => void;
  removeMilestone: (id: string) => void;
  updateMilestone: (id: string, data: Partial<Milestone>) => void;
  addAttachment: (att: Attachment) => void;
  removeAttachment: (id: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setIsSubmitting: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  reset: () => void;
  isFormEmpty: () => boolean;
}

const initialFormData: ProjectFormData = {
  title: '',
  category: '',
  description: '',
  summary: '',
  skills: [{ name: '', proficiency: 'intermediate' }],
  experienceLevel: '',
  requirements: [],
  locationType: '',
  location: '',
  budgetType: '',
  budgetMin: '',
  budgetMax: '',
  hourlyRate: '',
  duration: '',
  durationUnit: 'days',
  milestones: [],
  visibility: 'public',
  attachments: [],
  isFeatured: false,
  termsAccepted: false,
};

export const useCreateProject = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      projectId: null,
      status: '',
      formData: { ...initialFormData },
      errors: {},
      isSubmitting: false,
      lastSavedAt: null,
      hasUnsavedChanges: false,

      setCurrentStep: (step) => set({ currentStep: step }),
      
      setProjectId: (id) => set({ projectId: id }),
      
      setStatus: (status) => set({ status }),

      updateField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          errors: { ...state.errors, [field]: '' },
          hasUnsavedChanges: true,
        })),

      addSkill: (skill) =>
        set((state) => ({
          formData: {
            ...state.formData,
            skills: [...state.formData.skills, skill],
          },
          hasUnsavedChanges: true,
        })),

      removeSkill: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            skills: state.formData.skills.filter((_, i) => i !== index),
          },
          hasUnsavedChanges: true,
        })),

      updateSkill: (index, skill) =>
        set((state) => ({
          formData: {
            ...state.formData,
            skills: state.formData.skills.map((s, i) =>
              i === index ? { ...s, ...skill } : s
            ),
          },
          hasUnsavedChanges: true,
        })),

      addMilestone: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            milestones: [
              ...state.formData.milestones,
              {
                id: Date.now().toString(),
                title: '',
                amount: 0,
                deadlineDay: 0,
                deliverables: '',
              },
            ],
          },
          hasUnsavedChanges: true,
        })),

      removeMilestone: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            milestones: state.formData.milestones.filter((m) => m.id !== id),
          },
          hasUnsavedChanges: true,
        })),

      updateMilestone: (id, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            milestones: state.formData.milestones.map((m) =>
              m.id === id ? { ...m, ...data } : m
            ),
          },
          hasUnsavedChanges: true,
        })),

      addAttachment: (att) =>
        set((state) => ({
          formData: {
            ...state.formData,
            attachments: [...state.formData.attachments, att],
          },
          hasUnsavedChanges: true,
        })),

      removeAttachment: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            attachments: state.formData.attachments.filter((a) => a.id !== id),
          },
          hasUnsavedChanges: true,
        })),

      setErrors: (errors) => set({ errors }),
      
      clearErrors: () => set({ errors: {} }),
      
      setIsSubmitting: (value) => set({ isSubmitting: value }),

      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

      isFormEmpty: () => {
        const state = get();
        const fd = state.formData;
        return !fd.title && !fd.category && !fd.description && !fd.summary;
      },

      reset: () =>
        set({
          currentStep: 1,
          projectId: null,
          status: '',
          formData: { ...initialFormData },
          errors: {},
          isSubmitting: false,
          lastSavedAt: null,
          hasUnsavedChanges: false,
        }),
    }),
    {
      name: 'create-project-form',
      partialize: (state) => ({
        currentStep: state.currentStep,
        projectId: state.projectId,
        status: state.status,
        formData: state.formData,
        lastSavedAt: state.lastSavedAt,
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        isSubmitting: false,
        errors: {},
        hasUnsavedChanges: false,
      }),
    }
  )
);