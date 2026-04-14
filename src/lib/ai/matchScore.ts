import { IJob } from '@/types/job';
import { IProject } from '@/types/project';
import { IUser } from '@/types/user';

export interface MatchScoreResult {
  score: number; // 0-100
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

/**
 * Calculate match score between a user and a project
 */
export function calculateProjectMatch(user: IUser, project: IProject): MatchScoreResult {
  const breakdown = {
    skills: 0,
    experience: 0,
    location: 0,
    budget: 0,
    availability: 0,
  };

  const strengths: string[] = [];
  const gaps: string[] = [];

  // Skills matching (40%)
  if (user.skills && project.skills) {
    const userSkills = user.skills.map(s => s.name.toLowerCase());
    const projectSkills = project.skills.map(s => s.name.toLowerCase());
    const mandatorySkills = project.skills.filter(s => s.mandatory).map(s => s.name.toLowerCase());

    const matchingSkills = userSkills.filter(s => projectSkills.includes(s));
    const matchingMandatory = userSkills.filter(s => mandatorySkills.includes(s));

    const skillsScore = (matchingSkills.length / projectSkills.length) * 100;
    const mandatoryScore = mandatorySkills.length > 0 
      ? (matchingMandatory.length / mandatorySkills.length) * 100 
      : 100;

    breakdown.skills = Math.round((skillsScore * 0.6 + mandatoryScore * 0.4) * 0.4);

    if (matchingSkills.length > 0) {
      strengths.push(`Strong match in ${matchingSkills.length} required skills`);
    }
    if (matchingMandatory.length < mandatorySkills.length) {
      const missing = mandatorySkills.filter(s => !matchingMandatory.includes(s));
      gaps.push(`Missing mandatory skills: ${missing.join(', ')}`);
    }
  }

  // Experience level matching (25%)
  if (user.role === 'student' && project.experienceLevel) {
    const userLevel = getUserExperienceLevel(user);
    const experienceMatch = getExperienceLevelMatch(userLevel, project.experienceLevel);
    breakdown.experience = Math.round(experienceMatch * 0.25);

    if (experienceMatch > 80) {
      strengths.push('Experience level is a perfect match');
    } else if (experienceMatch < 50) {
      gaps.push(`Project requires ${project.experienceLevel} experience`);
    }
  }

  // Location matching (10%)
  breakdown.location = 0;

  // Budget expectations (15%)
  if (user.stats && project.budget) {
    const avgEarnings = user.stats.totalEarnings / Math.max(user.stats.projectsCompleted, 1);
    const projectBudget = (project.budget.min + project.budget.max) / 2;
    
    const budgetMatch = Math.min((projectBudget / Math.max(avgEarnings, 1000)) * 100, 100);
    breakdown.budget = Math.round(budgetMatch * 0.15);

    if (budgetMatch > 80) {
      strengths.push('Budget aligns with your expectations');
    } else if (budgetMatch < 50) {
      gaps.push('Budget may be lower than expected');
    }
  }

  // Availability (10%)
  if (project.duration) {
    breakdown.availability = 10; // Assume available for now
    strengths.push('Duration fits your schedule');
  }

  // Calculate total score
  const score = Math.min(
    Object.values(breakdown).reduce((sum, val) => sum + val, 0),
    100
  );

  return {
    score: Math.round(score),
    breakdown,
    strengths,
    gaps,
  };
}

/**
 * Calculate match score between a user and a job
 */
export function calculateJobMatch(user: IUser, job: IJob): MatchScoreResult {
  const breakdown = {
    skills: 0,
    experience: 0,
    location: 0,
    budget: 0,
    availability: 0,
  };

  const strengths: string[] = [];
  const gaps: string[] = [];

  // Skills matching (50%)
  if (user.skills && job.skills) {
    const userSkills = user.skills.map(s => s.name.toLowerCase());
    const requiredSkills = job.skills.filter(s => s.mandatory).map(s => s.name.toLowerCase());
    const preferredSkills = job.skills.filter(s => !s.mandatory).map(s => s.name.toLowerCase());

    const matchingRequired = userSkills.filter(s => requiredSkills.includes(s));
    const matchingPreferred = userSkills.filter(s => preferredSkills.includes(s));

    const requiredScore = (matchingRequired.length / requiredSkills.length) * 100;
    const preferredScore = preferredSkills.length > 0
      ? (matchingPreferred.length / preferredSkills.length) * 100
      : 100;

    breakdown.skills = Math.round((requiredScore * 0.7 + preferredScore * 0.3) * 0.5);

    if (matchingRequired.length === requiredSkills.length) {
      strengths.push('All required skills matched');
    }
    if (matchingPreferred.length > 0) {
      strengths.push(`${matchingPreferred.length} preferred skills matched`);
    }
    if (matchingRequired.length < requiredSkills.length) {
      gaps.push(`Missing ${requiredSkills.length - matchingRequired.length} required skills`);
    }
  }

  // Experience matching (30%)
  if (job.experience?.level) {
    const userLevel = getUserExperienceLevel(user);
    const experienceMatch = getExperienceLevelMatch(userLevel, job.experience.level);
    breakdown.experience = Math.round(experienceMatch * 0.3);

    if (experienceMatch > 80) {
      strengths.push('Experience level is ideal');
    } else if (experienceMatch < 50) {
      gaps.push(`Requires ${job.experience.level} experience`);
    }
  }

  // Location matching (10%)
  if (user.location && job.location && job.type !== 'remote') {
    const locationMatch = user.location.toLowerCase() === job.location.toLowerCase();
    breakdown.location = locationMatch ? 10 : 0;

    if (locationMatch) {
      strengths.push('Location match');
    } else {
      gaps.push('Different location');
    }
  } else if (job.type === 'remote') {
    breakdown.location = 10;
    strengths.push('Remote position');
  }

  // Salary expectations (10%)
  if (job.salary) {
    const avgSalary = (job.salary.min + job.salary.max) / 2;
    const expectedSalary = calculateExpectedSalary(user);
    
    const salaryMatch = Math.min((avgSalary / expectedSalary) * 100, 100);
    breakdown.budget = Math.round(salaryMatch * 0.1);

    if (salaryMatch > 80) {
      strengths.push('Salary meets expectations');
    }
  }

  // Calculate total score
  const score = Math.min(
    Object.values(breakdown).reduce((sum, val) => sum + val, 0),
    100
  );

  return {
    score: Math.round(score),
    breakdown,
    strengths,
    gaps,
  };
}

function getUserExperienceLevel(user: IUser): string {
  const yearsOfExperience = user.stats?.daysActive ? user.stats.daysActive / 365 : 0;
  
  if (yearsOfExperience < 1) return 'beginner';
  if (yearsOfExperience < 3) return 'intermediate';
  return 'advanced';
}

function getExperienceLevelMatch(userLevel: string, requiredLevel: string): number {
  if (requiredLevel === 'any') {
    return 100;
  }

  const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const userIndex = levels.indexOf(userLevel);
  const requiredIndex = levels.indexOf(requiredLevel);

  if (userIndex === requiredIndex) return 100;
  if (userIndex > requiredIndex) return 90; // Overqualified
  
  const diff = requiredIndex - userIndex;
  return Math.max(100 - (diff * 30), 0); // Underqualified
}

function calculateExpectedSalary(user: IUser): number {
  if (!user.stats) return 300000; // Default INR

  const baseOnProjects = user.stats.totalEarnings / Math.max(user.stats.projectsCompleted, 1) * 12;
  const baseOnSkills = user.skills.length * 50000;
  const trustScoreBonus = user.trustScore * 1000;

  return baseOnProjects + baseOnSkills + trustScoreBonus;
}

export default {
  calculateProjectMatch,
  calculateJobMatch,
};
