import type { IJob } from '@/types/job';
import type { Project } from '@/types/project';
import type { IUser } from '@/types/user';

export interface MatchScoreResult {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    location: number;
    budget: number;
    availability: number;
  };
  strengths: string[];
  gaps: string[];
}

export function calculateProjectMatch(user: IUser, project: Project): MatchScoreResult {
  const breakdown = { skills: 0, experience: 0, location: 0, budget: 0, availability: 0 };
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (user.skills && project.skills) {
    const userSkills = user.skills.map((s: any) => (s.name || s).toLowerCase());
    const projectSkills = project.skills.map(s => s.name.toLowerCase());
    const mandatorySkills = project.skills.filter(s => s.mandatory).map(s => s.name.toLowerCase());
    const matchingSkills = userSkills.filter(s => projectSkills.includes(s));
    const matchingMandatory = userSkills.filter(s => mandatorySkills.includes(s));
    const skillsScore = (matchingSkills.length / projectSkills.length) * 100;
    const mandatoryScore = mandatorySkills.length > 0 ? (matchingMandatory.length / mandatorySkills.length) * 100 : 100;
    breakdown.skills = Math.round((skillsScore * 0.6 + mandatoryScore * 0.4) * 0.4);
    if (matchingSkills.length > 0) strengths.push(`Strong match in ${matchingSkills.length} required skills`);
    if (matchingMandatory.length < mandatorySkills.length) {
      gaps.push(`Missing mandatory skills: ${mandatorySkills.filter(s => !matchingMandatory.includes(s)).join(', ')}`);
    }
  }

  if (user.role === 'student' && project.experienceLevel) {
    const userLevel = getUserExperienceLevel(user);
    const experienceMatch = getExperienceLevelMatch(userLevel, project.experienceLevel);
    breakdown.experience = Math.round(experienceMatch * 0.25);
    if (experienceMatch > 80) strengths.push('Experience level is a perfect match');
    else if (experienceMatch < 50) gaps.push(`Project requires ${project.experienceLevel} experience`);
  }

  if (user.stats && project.budget) {
    const avgEarnings = user.stats.totalEarnings / Math.max(user.stats.projectsCompleted, 1);
    const projectBudget = (project.budget.min + project.budget.max) / 2;
    const budgetMatch = Math.min((projectBudget / Math.max(avgEarnings, 1000)) * 100, 100);
    breakdown.budget = Math.round(budgetMatch * 0.15);
    if (budgetMatch > 80) strengths.push('Budget aligns with your expectations');
    else if (budgetMatch < 50) gaps.push('Budget may be lower than expected');
  }

  if (project.duration) { breakdown.availability = 10; strengths.push('Duration fits your schedule'); }

  const score = Math.min(Object.values(breakdown).reduce((sum, val) => sum + val, 0), 100);
  return { score: Math.round(score), breakdown, strengths, gaps };
}

export function calculateJobMatch(user: IUser, job: IJob): MatchScoreResult {
  const breakdown = { skills: 0, experience: 0, location: 0, budget: 0, availability: 0 };
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (user.skills && job.skills) {
    const userSkills = user.skills.map((s: any) => (s.name || s).toLowerCase());
    const requiredSkills = (job.skills as any[]).filter((s: any) => s.mandatory).map((s: any) => s.name.toLowerCase());
    const preferredSkills = (job.skills as any[]).filter((s: any) => !s.mandatory).map((s: any) => s.name.toLowerCase());
    const matchingRequired = userSkills.filter(s => requiredSkills.includes(s));
    const matchingPreferred = userSkills.filter(s => preferredSkills.includes(s));
    const requiredScore = requiredSkills.length > 0 ? (matchingRequired.length / requiredSkills.length) * 100 : 100;
    const preferredScore = preferredSkills.length > 0 ? (matchingPreferred.length / preferredSkills.length) * 100 : 100;
    breakdown.skills = Math.round((requiredScore * 0.7 + preferredScore * 0.3) * 0.5);
    if (matchingRequired.length === requiredSkills.length) strengths.push('All required skills matched');
    if (matchingPreferred.length > 0) strengths.push(`${matchingPreferred.length} preferred skills matched`);
  }

  if ((job as any).experience?.level) {
    const userLevel = getUserExperienceLevel(user);
    const expMatch = getExperienceLevelMatch(userLevel, (job as any).experience.level);
    breakdown.experience = Math.round(expMatch * 0.3);
  }

  if ((job as any).type === 'remote') { breakdown.location = 10; strengths.push('Remote position'); }

  const score = Math.min(Object.values(breakdown).reduce((sum, val) => sum + val, 0), 100);
  return { score: Math.round(score), breakdown, strengths, gaps };
}

function getUserExperienceLevel(user: IUser): string {
  const years = user.stats?.daysActive ? user.stats.daysActive / 365 : 0;
  if (years < 1) return 'beginner';
  if (years < 3) return 'intermediate';
  return 'advanced';
}

function getExperienceLevelMatch(userLevel: string, requiredLevel: string): number {
  if (requiredLevel === 'any') return 100;
  const levels = ['beginner', 'intermediate', 'advanced'];
  const userIndex = levels.indexOf(userLevel);
  const requiredIndex = levels.indexOf(requiredLevel);
  if (userIndex === requiredIndex) return 100;
  if (userIndex > requiredIndex) return 90;
  return Math.max(100 - ((requiredIndex - userIndex) * 30), 0);
}

export default { calculateProjectMatch, calculateJobMatch };