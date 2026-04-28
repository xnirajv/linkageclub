import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  skillId?: string;
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
  descriptionPlain: string;
  summary: string;
  skills: Skill[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'any' | '';
  requirements: string[];
  customRequirements: string[];
  locationType: 'remote' | 'onsite' | 'hybrid' | '';
  location: string;
  budgetType: 'fixed' | 'hourly' | 'milestone' | '';
  budgetMin: string;
  budgetMax: string;
  hourlyRate: string;
  duration: string;
  durationUnit: 'days' | 'weeks' | 'months';
  milestones: Milestone[];
  visibility: 'public' | 'private' | 'invite';
  attachments: Attachment[];
  isFeatured: boolean;
  termsAccepted: boolean;
}

interface ProjectStore {
  currentStep: number;
  projectId: string | null;
  status: 'draft' | 'published' | '';
  formData: ProjectFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  setCurrentStep: (step: number) => void;
  setProjectId: (id: string) => void;
  setStatus: (status: 'draft' | 'published') => void;
  updateField: <K extends keyof ProjectFormData>(field: K, value: ProjectFormData[K]) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (index: number) => void;
  updateSkill: (index: number, skill: Partial<Skill>) => void;
  addMilestone: () => void;
  removeMilestone: (id: string) => void;
  updateMilestone: (id: string, data: Partial<Milestone>) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setIsSubmitting: (value: boolean) => void;
  reset: () => void;
}

const initialFormData: ProjectFormData = {
  title: '',
  category: '',
  description: '',
  descriptionPlain: '',
  summary: '',
  skills: [{ name: '', proficiency: 'intermediate' }],
  experienceLevel: '',
  requirements: [],
  customRequirements: [],
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
    (set) => ({
      currentStep: 1,
      projectId: null,
      status: '',
      formData: initialFormData,
      errors: {},
      isSubmitting: false,

      setCurrentStep: (step) => set({ currentStep: step }),
      setProjectId: (id) => set({ projectId: id }),
      setStatus: (status) => set({ status }),

      updateField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          errors: { ...state.errors, [field]: '' },
        })),

      addSkill: (skill) =>
        set((state) => ({
          formData: {
            ...state.formData,
            skills: [...state.formData.skills, skill],
          },
        })),

      removeSkill: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            skills: state.formData.skills.filter((_, i) => i !== index),
          },
        })),

      updateSkill: (index, skill) =>
        set((state) => ({
          formData: {
            ...state.formData,
            skills: state.formData.skills.map((s, i) => (i === index ? { ...s, ...skill } : s)),
          },
        })),

      addMilestone: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            milestones: [
              ...state.formData.milestones,
              { id: Date.now().toString(), title: '', amount: 0, deadlineDay: 0, deliverables: '' },
            ],
          },
        })),

      removeMilestone: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            milestones: state.formData.milestones.filter((m) => m.id !== id),
          },
        })),

      updateMilestone: (id, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            milestones: state.formData.milestones.map((m) =>
              m.id === id ? { ...m, ...data } : m
            ),
          },
        })),

      addAttachment: (attachment) =>
        set((state) => ({
          formData: {
            ...state.formData,
            attachments: [...state.formData.attachments, attachment],
          },
        })),

      removeAttachment: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            attachments: state.formData.attachments.filter((a) => a.id !== id),
          },
        })),

      setErrors: (errors) => set({ errors }),
      clearErrors: () => set({ errors: {} }),
      setIsSubmitting: (value) => set({ isSubmitting: value }),
      reset: () =>
        set({
          currentStep: 1,
          projectId: null,
          status: '',
          formData: initialFormData,
          errors: {},
          isSubmitting: false,
        }),
    }),
    { name: 'create-project-form' }
  )
);