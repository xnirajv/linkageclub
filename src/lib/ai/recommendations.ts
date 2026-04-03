import { calculateProjectMatch, calculateJobMatch } from './matchScore';
import { IMentor } from '@/types/mentor';
import { IJob } from '@/types/job';
import { IProject } from '@/types/project';
import { IUser } from '@/types/user';

export interface RecommendationResult<T> {
  items: T[];
  scores: Map<string, number>;
  reasons: Map<string, string[]>;
}

/**
 * Get recommended projects for a user
 */
export async function getProjectRecommendations(
  user: IUser,
  projects: IProject[],
  limit: number = 10
): Promise<RecommendationResult<IProject>> {
  const scoredProjects = projects.map(project => {
    const match = calculateProjectMatch(user, project);
    return {
      project,
      score: match.score,
      reasons: match.strengths,
    };
  });

  // Sort by score
  scoredProjects.sort((a, b) => b.score - a.score);

  // Apply diversity filters
  const diverseProjects = applyDiversityFilter(scoredProjects, limit);

  const scores = new Map<string, number>();
  const reasons = new Map<string, string[]>();

  diverseProjects.forEach(({ project, score, reasons: itemReasons }) => {
    scores.set(project._id.toString(), score);
    reasons.set(project._id.toString(), itemReasons);
  });

  return {
    items: diverseProjects.map(p => p.project),
    scores,
    reasons,
  };
}

/**
 * Get recommended jobs for a user
 */
export async function getJobRecommendations(
  user: IUser,
  jobs: IJob[],
  limit: number = 10
): Promise<RecommendationResult<IJob>> {
  const scoredJobs = jobs.map(job => {
    const match = calculateJobMatch(user, job);
    return {
      job,
      score: match.score,
      reasons: match.strengths,
    };
  });

  // Sort by score
  scoredJobs.sort((a, b) => b.score - a.score);

  // Apply diversity filters
  const diverseJobs = applyDiversityFilter(scoredJobs, limit);

  const scores = new Map<string, number>();
  const reasons = new Map<string, string[]>();

  diverseJobs.forEach(({ job, score, reasons: itemReasons }) => {
    scores.set(job._id.toString(), score);
    reasons.set(job._id.toString(), itemReasons);
  });

  return {
    items: diverseJobs.map(j => j.job),
    scores,
    reasons,
  };
}

/**
 * Get recommended mentors for a user
 */
export async function getMentorRecommendations(
  user: IUser,
  mentors: IMentor[],
  limit: number = 10
): Promise<RecommendationResult<IMentor>> {
  const scoredMentors = mentors.map(mentor => {
    const score = calculateMentorMatch(user, mentor);
    const reasons = generateMentorReasons(user, mentor);
    return { mentor, score, reasons };
  });

  // Sort by score
  scoredMentors.sort((a, b) => b.score - a.score);

  const topMentors = scoredMentors.slice(0, limit);

  const scores = new Map<string, number>();
  const reasons = new Map<string, string[]>();

  topMentors.forEach(({ mentor, score, reasons: itemReasons }) => {
    scores.set(mentor._id.toString(), score);
    reasons.set(mentor._id.toString(), itemReasons);
  });

  return {
    items: topMentors.map(m => m.mentor),
    scores,
    reasons,
  };
}

/**
 * Calculate mentor match score
 */
function calculateMentorMatch(user: IUser, mentor: IMentor): number {
  let score = 0;

  // Expertise match (40%)
  if (user.skills && mentor.expertise) {
    const userSkills = user.skills.map(s => s.name.toLowerCase());
    const mentorExpertise = mentor.expertise.map(e => e.skill.toLowerCase());
    const matching = userSkills.filter(s => mentorExpertise.includes(s));
    score += (matching.length / Math.max(userSkills.length, 1)) * 40;
  }

  // Rating (30%)
  const averageRating = mentor.stats?.averageRating ?? 0;
  if (averageRating) {
    score += (averageRating / 5) * 30;
  }

  // Availability (15%)
  if (mentor.availability?.type) {
    score += 15;
  }

  // Price affordability (15%)
  if (mentor.hourlyRate && user.stats) {
    const affordability = Math.min((50000 / mentor.hourlyRate) * 100, 100);
    score += (affordability / 100) * 15;
  }

  return Math.round(score);
}

/**
 * Generate reasons for mentor recommendation
 */
function generateMentorReasons(user: IUser, mentor: IMentor): string[] {
  const reasons: string[] = [];

  if (user.skills && mentor.expertise) {
    const userSkills = user.skills.map(s => s.name.toLowerCase());
    const mentorExpertise = mentor.expertise.map(e => e.skill.toLowerCase());
    const matching = userSkills.filter(s => mentorExpertise.includes(s));
    
    if (matching.length > 0) {
      reasons.push(`Expert in ${matching.slice(0, 3).join(', ')}`);
    }
  }

  const averageRating = mentor.stats?.averageRating ?? 0;
  if (averageRating >= 4.5) {
    reasons.push(`Highly rated (${averageRating}/5)`);
  }

  if (mentor.stats?.totalSessions && mentor.stats.totalSessions > 50) {
    reasons.push(`Experienced with ${mentor.stats.totalSessions}+ sessions`);
  }

  if (mentor.availability?.type === 'flexible') {
    reasons.push('Flexible availability');
  }

  return reasons;
}

/**
 * Apply diversity filter to avoid recommending too similar items
 */
function applyDiversityFilter<T extends { project?: any; job?: any; score: number }>(
  items: T[],
  limit: number
): T[] {
  const diverse: T[] = [];
  const categories = new Set<string>();

  for (const item of items) {
    if (diverse.length >= limit) break;

    const category = item.project?.category || item.job?.category;
    
    // Add if category not seen or we need more items
    if (!category || !categories.has(category) || diverse.length < limit / 2) {
      diverse.push(item);
      if (category) categories.add(category);
    }
  }

  // Fill remaining slots with highest scores
  while (diverse.length < limit && diverse.length < items.length) {
    const remaining = items.filter(item => !diverse.includes(item));
    if (remaining.length > 0) {
      diverse.push(remaining[0]);
    } else {
      break;
    }
  }

  return diverse;
}

/**
 * Get personalized learning path recommendations
 */
export function getLearningPathRecommendations(user: IUser): string[] {
  const paths: string[] = [];

  if (!user.skills || user.skills.length === 0) {
    return ['Beginner Programming', 'Web Development Basics', 'Introduction to Data Science'];
  }

  const skillLevels = user.skills.map(s => s.level);
  const hasAdvanced = skillLevels.includes('advanced') || skillLevels.includes('expert');

  if (!hasAdvanced) {
    paths.push('Intermediate to Advanced Track');
  }

  const skillNames = user.skills.map(s => s.name.toLowerCase());

  if (skillNames.some(s => ['javascript', 'react', 'node.js'].includes(s))) {
    paths.push('Full Stack Development Mastery');
  }

  if (skillNames.some(s => ['python', 'pandas', 'numpy'].includes(s))) {
    paths.push('Data Science & Machine Learning');
  }

  if (skillNames.some(s => ['aws', 'docker', 'kubernetes'].includes(s))) {
    paths.push('Cloud & DevOps Engineering');
  }

  if (paths.length === 0) {
    paths.push('Career Development', 'Soft Skills Mastery');
  }

  return paths.slice(0, 5);
}

export default {
  getProjectRecommendations,
  getJobRecommendations,
  getMentorRecommendations,
  getLearningPathRecommendations,
};
