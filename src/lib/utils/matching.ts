/**
 * AI-powered matching utilities for projects, jobs, mentors, and co-founders
 */

interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years?: number;
}

interface UserProfile {
  id: string;
  skills: Skill[];
  experience?: number;
  education?: string[];
  preferences?: Record<string, any>;
  trustScore?: number;
  availability?: string;
  location?: string;
  remotePreference?: boolean;
  hourlyRate?: number;
  previousProjects?: string[];
  reviews?: { rating: number }[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  requiredSkills: Skill[];
  budget: { min: number; max: number };
  duration: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  location?: string;
  remote: boolean;
  category: string;
  companyId: string;
  postedAt: Date;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: Skill[];
  salary: { min: number; max: number };
  experience: { min: number; max: number };
  location?: string;
  remote: boolean;
  type: string;
  companyId: string;
  postedAt: Date;
}

interface Mentor {
  id: string;
  userId: string;
  expertise: Skill[];
  hourlyRate: number;
  availability: string;
  rating: number;
  totalSessions: number;
  languages?: string[];
  timezone?: string;
}

interface Founder {
  id: string;
  userId: string;
  startupStage: string;
  industry: string;
  lookingFor: string[];
  skills: Skill[];
  experience?: number;
  pastStartups?: string[];
}

/**
 * Calculate match score between a user and a project
 */
export function calculateProjectMatch(
  user: UserProfile,
  project: Project
): {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    budget: number;
    timeline: number;
    location: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
} {
  // Skill match (40% weight)
  const skillMatch = calculateSkillMatch(user.skills, project.requiredSkills);
  
  // Experience match (20% weight)
  const experienceMatch = calculateExperienceMatch(
    user.experience || 0,
    project.experienceLevel
  );
  
  // Budget match (15% weight)
  const budgetMatch = calculateBudgetMatch(
    user.hourlyRate || 0,
    project.budget
  );
  
  // Timeline match (15% weight)
  const timelineMatch = calculateTimelineMatch(
    user.availability || '',
    project.duration
  );
  
  // Location match (10% weight)
  const locationMatch = calculateLocationMatch(
    user.location || '',
    user.remotePreference || false,
    project.location,
    project.remote
  );
  
  // Calculate weighted score
  const score = Math.round(
    skillMatch.score * 0.4 +
    experienceMatch * 0.2 +
    budgetMatch * 0.15 +
    timelineMatch * 0.15 +
    locationMatch * 0.1
  );

  return {
    score,
    breakdown: {
      skills: skillMatch.score,
      experience: experienceMatch,
      budget: budgetMatch,
      timeline: timelineMatch,
      location: locationMatch,
    },
    matchedSkills: skillMatch.matched,
    missingSkills: skillMatch.missing,
    recommendations: generateProjectRecommendations(skillMatch, experienceMatch),
  };
}

/**
 * Calculate match score between a user and a job
 */
export function calculateJobMatch(
  user: UserProfile,
  job: Job
): {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    salary: number;
    location: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
} {
  // Skill match (50% weight)
  const skillMatch = calculateSkillMatch(user.skills, job.requiredSkills);
  
  // Experience match (25% weight)
  const experienceMatch = calculateJobExperienceMatch(
    user.experience || 0,
    job.experience
  );
  
  // Salary match (15% weight)
  const salaryMatch = calculateSalaryMatch(
    user.hourlyRate || 0,
    job.salary
  );
  
  // Location match (10% weight)
  const locationMatch = calculateLocationMatch(
    user.location || '',
    user.remotePreference || false,
    job.location,
    job.remote
  );
  
  const score = Math.round(
    skillMatch.score * 0.5 +
    experienceMatch * 0.25 +
    salaryMatch * 0.15 +
    locationMatch * 0.1
  );

  return {
    score,
    breakdown: {
      skills: skillMatch.score,
      experience: experienceMatch,
      salary: salaryMatch,
      location: locationMatch,
    },
    matchedSkills: skillMatch.matched,
    missingSkills: skillMatch.missing,
    recommendations: generateJobRecommendations(skillMatch, experienceMatch),
  };
}

/**
 * Calculate match score between a student and a mentor
 */
export function calculateMentorMatch(
  student: UserProfile,
  mentor: Mentor
): {
  score: number;
  breakdown: {
    expertise: number;
    availability: number;
    budget: number;
    rating: number;
  };
  matchedExpertise: string[];
  recommendations: string[];
} {
  // Expertise match (40% weight)
  const expertiseMatch = calculateExpertiseMatch(student.skills, mentor.expertise);
  
  // Availability match (20% weight)
  const availabilityMatch = calculateAvailabilityMatch(
    student.availability || '',
    mentor.availability
  );
  
  // Budget match (20% weight)
  const budgetMatch = calculateMentorBudgetMatch(
    student.hourlyRate || 0,
    mentor.hourlyRate
  );
  
  // Rating and experience (20% weight)
  const ratingMatch = calculateMentorRatingMatch(
    mentor.rating,
    mentor.totalSessions
  );
  
  const score = Math.round(
    expertiseMatch.score * 0.4 +
    availabilityMatch * 0.2 +
    budgetMatch * 0.2 +
    ratingMatch * 0.2
  );

  return {
    score,
    breakdown: {
      expertise: expertiseMatch.score,
      availability: availabilityMatch,
      budget: budgetMatch,
      rating: ratingMatch,
    },
    matchedExpertise: expertiseMatch.matched,
    recommendations: generateMentorRecommendations(expertiseMatch),
  };
}

/**
 * Calculate match score between founders for co-founder matching
 */
export function calculateCoFounderMatch(
  founder1: Founder,
  founder2: Founder
): {
  score: number;
  breakdown: {
    complementary: number;
    sharedVision: number;
    experience: number;
    availability: number;
  };
  strengths: string[];
  gaps: string[];
} {
  // Complementary skills (35% weight)
  const complementaryScore = calculateComplementarySkills(
    founder1.skills,
    founder2.skills
  );
  
  // Shared vision/industry (25% weight)
  const sharedVisionScore = calculateSharedVision(
    founder1.industry,
    founder1.startupStage,
    founder2.industry,
    founder2.startupStage
  );
  
  // Combined experience (20% weight)
  const experienceScore = calculateCombinedExperience(
    founder1.experience || 0,
    founder2.experience || 0
  );
  
  // Availability and commitment (20% weight)
  const availabilityScore = calculateFounderAvailability(
    founder1.lookingFor,
    founder2.lookingFor
  );
  
  const score = Math.round(
    complementaryScore * 0.35 +
    sharedVisionScore * 0.25 +
    experienceScore * 0.2 +
    availabilityScore * 0.2
  );

  return {
    score,
    breakdown: {
      complementary: complementaryScore,
      sharedVision: sharedVisionScore,
      experience: experienceScore,
      availability: availabilityScore,
    },
    strengths: generateFounderStrengths(complementaryScore, sharedVisionScore),
    gaps: generateFounderGaps(complementaryScore, sharedVisionScore),
  };
}

/**
 * Calculate skill match between user skills and required skills
 */
function calculateSkillMatch(
  userSkills: Skill[],
  requiredSkills: Skill[]
): {
  score: number;
  matched: string[];
  missing: string[];
  partial: string[];
} {
  const matched: string[] = [];
  const missing: string[] = [];
  const partial: string[] = [];
  
  let totalScore = 0;
  const maxScore = requiredSkills.length * 100;
  
  requiredSkills.forEach(required => {
    const userSkill = userSkills.find(s => 
      s.name.toLowerCase() === required.name.toLowerCase()
    );
    
    if (userSkill) {
      matched.push(required.name);
      
      // Score based on level match
      const levelScore = calculateLevelScore(userSkill.level, required.level);
      totalScore += levelScore * 100;
      
      // Bonus for years of experience
      if (userSkill.years && required.years) {
        const yearsBonus = Math.min(userSkill.years / required.years, 2) * 10;
        totalScore += yearsBonus;
      }
    } else {
      // Check for partial matches (similar skills)
      const similarSkill = userSkills.find(s => 
        isSimilarSkill(s.name, required.name)
      );
      
      if (similarSkill) {
        partial.push(required.name);
        totalScore += 50; // Partial match
      } else {
        missing.push(required.name);
      }
    }
  });
  
  return {
    score: Math.round((totalScore / maxScore) * 100),
    matched,
    missing,
    partial,
  };
}

/**
 * Calculate experience level match
 */
function calculateExperienceMatch(
  userExperience: number,
  requiredLevel: string
): number {
  const levelMap: Record<string, number> = {
    beginner: 1,
    intermediate: 3,
    advanced: 5,
  };
  
  const requiredYears = levelMap[requiredLevel] || 3;
  const ratio = Math.min(userExperience / requiredYears, 2);
  
  return Math.min(Math.round(ratio * 50), 100);
}

/**
 * Calculate job experience match
 */
function calculateJobExperienceMatch(
  userExperience: number,
  required: { min: number; max: number }
): number {
  if (userExperience < required.min) {
    return Math.round((userExperience / required.min) * 60);
  }
  if (userExperience > required.max) {
    return Math.round((required.max / userExperience) * 80);
  }
  return 100;
}

/**
 * Calculate budget match for projects
 */
function calculateBudgetMatch(
  userRate: number,
  projectBudget: { min: number; max: number }
): number {
  if (userRate === 0) return 50; // No rate specified
  
  if (userRate >= projectBudget.min && userRate <= projectBudget.max) {
    return 100;
  }
  
  if (userRate < projectBudget.min) {
    return Math.round((userRate / projectBudget.min) * 80);
  }
  
  return Math.round((projectBudget.max / userRate) * 70);
}

/**
 * Calculate salary match for jobs
 */
function calculateSalaryMatch(
  expectedSalary: number,
  jobSalary: { min: number; max: number }
): number {
  if (expectedSalary === 0) return 50;
  
  if (expectedSalary >= jobSalary.min && expectedSalary <= jobSalary.max) {
    return 100;
  }
  
  if (expectedSalary < jobSalary.min) {
    return Math.round((expectedSalary / jobSalary.min) * 80);
  }
  
  return Math.round((jobSalary.max / expectedSalary) * 60);
}

/**
 * Calculate timeline match
 */
function calculateTimelineMatch(
  userAvailability: string,
  projectDuration: number
): number {
  // Simple implementation - can be enhanced
  if (userAvailability === 'immediate') return 100;
  if (userAvailability === 'part-time') return 70;
  if (userAvailability.includes('week')) return 50;
  return 30;
}

/**
 * Calculate location match
 */
function calculateLocationMatch(
  userLocation: string,
  userRemote: boolean,
  jobLocation?: string,
  jobRemote?: boolean
): number {
  if (jobRemote && userRemote) return 100;
  if (jobRemote) return 80;
  if (userLocation && jobLocation && userLocation === jobLocation) return 100;
  if (userLocation && jobLocation) return 50;
  return 30;
}

/**
 * Calculate expertise match for mentors
 */
function calculateExpertiseMatch(
  studentSkills: Skill[],
  mentorExpertise: Skill[]
): {
  score: number;
  matched: string[];
} {
  const matched: string[] = [];
  let totalScore = 0;
  
  studentSkills.forEach(studentSkill => {
    const match = mentorExpertise.find(m => 
      m.name.toLowerCase() === studentSkill.name.toLowerCase()
    );
    
    if (match) {
      matched.push(studentSkill.name);
      totalScore += 100;
      
      // Bonus for expert level
      if (match.level === 'expert') totalScore += 20;
    }
  });
  
  const maxScore = studentSkills.length * 100;
  return {
    score: Math.round((totalScore / maxScore) * 100),
    matched,
  };
}

/**
 * Calculate availability match
 */
function calculateAvailabilityMatch(
  studentAvailability: string,
  mentorAvailability: string
): number {
  if (studentAvailability === mentorAvailability) return 100;
  if (mentorAvailability === 'flexible') return 90;
  return 50;
}

/**
 * Calculate mentor budget match
 */
function calculateMentorBudgetMatch(
  studentBudget: number,
  mentorRate: number
): number {
  if (studentBudget === 0) return 50;
  if (studentBudget >= mentorRate) return 100;
  return Math.round((studentBudget / mentorRate) * 80);
}

/**
 * Calculate mentor rating match
 */
function calculateMentorRatingMatch(
  rating: number,
  totalSessions: number
): number {
  const ratingScore = (rating / 5) * 70;
  const sessionScore = Math.min(totalSessions / 50, 1) * 30;
  return Math.round(ratingScore + sessionScore);
}

/**
 * Calculate complementary skills for co-founders
 */
function calculateComplementarySkills(
  skills1: Skill[],
  skills2: Skill[]
): number {
  const skillNames1 = skills1.map(s => s.name.toLowerCase());
  const skillNames2 = skills2.map(s => s.name.toLowerCase());
  
  const overlap = skillNames1.filter(s => skillNames2.includes(s));
  const unique1 = skillNames1.filter(s => !skillNames2.includes(s));
  const unique2 = skillNames2.filter(s => !skillNames1.includes(s));
  
  // Good to have some overlap but mostly complementary
  const overlapScore = Math.max(0, 30 - overlap.length * 5);
  const uniqueScore = Math.min(70, (unique1.length + unique2.length) * 10);
  
  return overlapScore + uniqueScore;
}

/**
 * Calculate shared vision score
 */
function calculateSharedVision(
  industry1: string,
  stage1: string,
  industry2: string,
  stage2: string
): number {
  let score = 0;
  
  if (industry1 === industry2) score += 50;
  if (stage1 === stage2) score += 30;
  
  // Check if stages are compatible
  const stages = ['idea', 'mvp', 'launched', 'growth', 'scaling'];
  const index1 = stages.indexOf(stage1);
  const index2 = stages.indexOf(stage2);
  
  if (Math.abs(index1 - index2) <= 1) score += 20;
  
  return score;
}

/**
 * Calculate combined experience score
 */
function calculateCombinedExperience(
  exp1: number,
  exp2: number
): number {
  const total = exp1 + exp2;
  return Math.min(Math.round(total * 10), 100);
}

/**
 * Calculate founder availability match
 */
function calculateFounderAvailability(
  lookingFor1: string[],
  lookingFor2: string[]
): number {
  const needs = new Set(lookingFor1);
  const offers = new Set(lookingFor2);
  
  let matches = 0;
  needs.forEach(need => {
    if (offers.has(need)) matches++;
  });
  
  return Math.min(Math.round((matches / needs.size) * 100), 100);
}

/**
 * Check if skills are similar
 */
function isSimilarSkill(skill1: string, skill2: string): boolean {
  const similarPairs: Record<string, string[]> = {
    'react': ['reactjs', 'react.js'],
    'node': ['nodejs', 'node.js'],
    'js': ['javascript'],
    'ts': ['typescript'],
    'py': ['python'],
  };
  
  const normalized1 = skill1.toLowerCase();
  const normalized2 = skill2.toLowerCase();
  
  if (normalized1 === normalized2) return true;
  
  for (const [base, variants] of Object.entries(similarPairs)) {
    if (variants.includes(normalized1) && variants.includes(normalized2)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calculate level match score
 */
function calculateLevelScore(
  userLevel?: string,
  requiredLevel?: string
): number {
  const levelValues: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };
  
  const user = userLevel ? levelValues[userLevel] || 2 : 2;
  const required = requiredLevel ? levelValues[requiredLevel] || 2 : 2;
  
  if (user >= required) return 1;
  return user / required;
}

/**
 * Generate project recommendations
 */
function generateProjectRecommendations(
  skillMatch: { missing: string[]; partial: string[] },
  experienceMatch: number
): string[] {
  const recommendations: string[] = [];
  
  if (skillMatch.missing.length > 0) {
    recommendations.push(`Consider learning: ${skillMatch.missing.slice(0, 3).join(', ')}`);
  }
  
  if (skillMatch.partial.length > 0) {
    recommendations.push(`Strengthen your skills in: ${skillMatch.partial.slice(0, 3).join(', ')}`);
  }
  
  if (experienceMatch < 70) {
    recommendations.push('Gain more experience with similar projects');
  }
  
  return recommendations;
}

/**
 * Generate job recommendations
 */
function generateJobRecommendations(
  skillMatch: { missing: string[] },
  experienceMatch: number
): string[] {
  const recommendations: string[] = [];
  
  if (skillMatch.missing.length > 0) {
    recommendations.push(`Acquire these skills: ${skillMatch.missing.slice(0, 3).join(', ')}`);
  }
  
  if (experienceMatch < 70) {
    recommendations.push('Consider internship or entry-level positions first');
  }
  
  return recommendations;
}

/**
 * Generate mentor recommendations
 */
function generateMentorRecommendations(
  expertiseMatch: { matched: string[] }
): string[] {
  const recommendations: string[] = [];
  
  if (expertiseMatch.matched.length === 0) {
    recommendations.push('Look for mentors with broader expertise');
  }
  
  return recommendations;
}

/**
 * Generate founder strengths
 */
function generateFounderStrengths(
  complementary: number,
  sharedVision: number
): string[] {
  const strengths: string[] = [];
  
  if (complementary > 70) {
    strengths.push('Complementary skill sets');
  }
  
  if (sharedVision > 60) {
    strengths.push('Aligned industry vision');
  }
  
  return strengths;
}

/**
 * Generate founder gaps
 */
function generateFounderGaps(
  complementary: number,
  sharedVision: number
): string[] {
  const gaps: string[] = [];
  
  if (complementary < 50) {
    gaps.push('Skills may overlap too much');
  }
  
  if (sharedVision < 40) {
    gaps.push('Different industry focus');
  }
  
  return gaps;
}

// Export all matching functions
export const Matching = {
  project: calculateProjectMatch,
  job: calculateJobMatch,
  mentor: calculateMentorMatch,
  cofounder: calculateCoFounderMatch,
};