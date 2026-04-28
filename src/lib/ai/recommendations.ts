import { calculateProjectMatch, calculateJobMatch } from './matchScore';
import type { IMentor } from '@/types/mentor';
import type { IJob } from '@/types/job';
import type { Project } from '@/types/project';
import type { IUser } from '@/types/user';

export interface RecommendationResult<T> {
  items: T[];
  scores: Map<string, number>;
  reasons: Map<string, string[]>;
}

export async function getProjectRecommendations(
  user: IUser,
  projects: Project[],
  limit: number = 10
): Promise<RecommendationResult<Project>> {
  const scoredProjects = projects.map(project => {
    const match = calculateProjectMatch(user, project);
    return { project, score: match.score, reasons: match.strengths };
  });

  scoredProjects.sort((a, b) => b.score - a.score);
  const diverseProjects = applyDiversityFilter(scoredProjects, limit);

  const scores = new Map<string, number>();
  const reasons = new Map<string, string[]>();

  diverseProjects.forEach(({ project, score, reasons: itemReasons }) => {
    scores.set(project._id.toString(), score);
    reasons.set(project._id.toString(), itemReasons);
  });

  return { items: diverseProjects.map(p => p.project), scores, reasons };
}

export async function getJobRecommendations(
  user: IUser,
  jobs: IJob[],
  limit: number = 10
): Promise<RecommendationResult<IJob>> {
  const scoredJobs = jobs.map(job => {
    const match = calculateJobMatch(user, job);
    return { job, score: match.score, reasons: match.strengths };
  });

  scoredJobs.sort((a, b) => b.score - a.score);
  const diverseJobs = applyDiversityFilter(scoredJobs, limit);

  const scores = new Map<string, number>();
  const reasons = new Map<string, string[]>();

  diverseJobs.forEach(({ job, score, reasons: itemReasons }) => {
    scores.set(job._id.toString(), score);
    reasons.set(job._id.toString(), itemReasons);
  });

  return { items: diverseJobs.map(j => j.job), scores, reasons };
}

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

  scoredMentors.sort((a, b) => b.score - a.score);
  const topMentors = scoredMentors.slice(0, limit);

  const scores = new Map<string, number>();
  const reasons = new Map<string, string[]>();

  topMentors.forEach(({ mentor, score, reasons: itemReasons }) => {
    scores.set(mentor._id.toString(), score);
    reasons.set(mentor._id.toString(), itemReasons);
  });

  return { items: topMentors.map(m => m.mentor), scores, reasons };
}

function calculateMentorMatch(user: IUser, mentor: IMentor): number {
  let score = 0;

  if (user.skills && mentor.expertise) {
    const userSkills = user.skills.map((s: any) => (s.name || s).toLowerCase());
    const mentorExpertise = mentor.expertise.map((e: any) => (e.skill || e).toLowerCase());
    const matching = userSkills.filter(s => mentorExpertise.includes(s));
    score += (matching.length / Math.max(userSkills.length, 1)) * 40;
  }

  const avgRating = (mentor.stats as any)?.averageRating ?? 0;
  if (avgRating) score += (avgRating / 5) * 30;
  if ((mentor as any).availability?.type) score += 15;
  if ((mentor as any).hourlyRate && user.stats) {
    const affordability = Math.min((50000 / (mentor as any).hourlyRate) * 100, 100);
    score += (affordability / 100) * 15;
  }

  return Math.round(score);
}

function generateMentorReasons(user: IUser, mentor: IMentor): string[] {
  const reasons: string[] = [];
  if (user.skills && mentor.expertise) {
    const userSkills = user.skills.map((s: any) => (s.name || s).toLowerCase());
    const mentorExpertise = mentor.expertise.map((e: any) => (e.skill || e).toLowerCase());
    const matching = userSkills.filter(s => mentorExpertise.includes(s));
    if (matching.length > 0) reasons.push(`Expert in ${matching.slice(0, 3).join(', ')}`);
  }
  const avgRating = (mentor.stats as any)?.averageRating ?? 0;
  if (avgRating >= 4.5) reasons.push(`Highly rated (${avgRating}/5)`);
  return reasons;
}

function applyDiversityFilter<T extends { project?: any; job?: any; score: number }>(
  items: T[], limit: number
): T[] {
  const diverse: T[] = [];
  const categories = new Set<string>();
  for (const item of items) {
    if (diverse.length >= limit) break;
    const category = item.project?.category || item.job?.category;
    if (!category || !categories.has(category) || diverse.length < limit / 2) {
      diverse.push(item);
      if (category) categories.add(category);
    }
  }
  while (diverse.length < limit && diverse.length < items.length) {
    const remaining = items.filter(item => !diverse.includes(item));
    if (remaining.length > 0) diverse.push(remaining[0]);
    else break;
  }
  return diverse;
}

export function getLearningPathRecommendations(user: IUser): string[] {
  const paths: string[] = [];
  if (!user.skills || user.skills.length === 0) {
    return ['Beginner Programming', 'Web Development Basics', 'Introduction to Data Science'];
  }
  const skillLevels = user.skills.map((s: any) => s.level);
  const hasAdvanced = skillLevels.includes('advanced') || skillLevels.includes('expert');
  if (!hasAdvanced) paths.push('Intermediate to Advanced Track');
  const skillNames = user.skills.map((s: any) => (s.name || s).toLowerCase());
  if (skillNames.some((s: string) => ['javascript', 'react', 'node.js'].includes(s))) paths.push('Full Stack Development Mastery');
  if (skillNames.some((s: string) => ['python', 'pandas', 'numpy'].includes(s))) paths.push('Data Science & Machine Learning');
  if (skillNames.some((s: string) => ['aws', 'docker', 'kubernetes'].includes(s))) paths.push('Cloud & DevOps Engineering');
  if (paths.length === 0) paths.push('Career Development', 'Soft Skills Mastery');
  return paths.slice(0, 5);
}

export default { getProjectRecommendations, getJobRecommendations, getMentorRecommendations, getLearningPathRecommendations };