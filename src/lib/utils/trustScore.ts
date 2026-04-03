/**
 * Trust Score calculation utilities
 * Trust Score is a 0-100 rating that represents user reliability and skill level
 */

interface TrustScoreFactors {
  // Skill factors (35% weight)
  skills: {
    verified: number;
    total: number;
    endorsements: number;
    testsPassed: number;
    averageLevel: number; // 1-4 scale
  };
  
  // Project factors (30% weight)
  projects: {
    completed: number;
    onTime: number;
    positiveReviews: number;
    totalReviews: number;
    totalEarned: number;
  };
  
  // Activity factors (20% weight)
  activity: {
    daysActive: number;
    profileCompleteness: number; // 0-100
    responseRate: number; // 0-100
    communityPosts: number;
    helpfulVotes: number;
  };
  
  // Verification factors (15% weight)
  verification: {
    email: boolean;
    phone: boolean;
    id: boolean;
    linkedin: boolean;
    github: boolean;
    paymentMethod: boolean;
  };
}

interface TrustScoreBreakdown {
  skills: number;
  projects: number;
  activity: number;
  verification: number;
  total: number;
}

interface TrustScoreHistory {
  date: Date;
  score: number;
  reason: string;
}

/**
 * Calculate trust score from factors
 */
export function calculateTrustScore(factors: TrustScoreFactors): TrustScoreBreakdown {
  // Calculate skill score (max 100)
  const skillScore = calculateSkillScore(factors.skills);
  
  // Calculate project score (max 100)
  const projectScore = calculateProjectScore(factors.projects);
  
  // Calculate activity score (max 100)
  const activityScore = calculateActivityScore(factors.activity);
  
  // Calculate verification score (max 100)
  const verificationScore = calculateVerificationScore(factors.verification);
  
  // Calculate total weighted score
  const total = Math.round(
    (skillScore * 0.35) +
    (projectScore * 0.30) +
    (activityScore * 0.20) +
    (verificationScore * 0.15)
  );

  return {
    skills: Math.round(skillScore),
    projects: Math.round(projectScore),
    activity: Math.round(activityScore),
    verification: Math.round(verificationScore),
    total,
  };
}

/**
 * Calculate skill score component
 */
function calculateSkillScore(skills: TrustScoreFactors['skills']): number {
  let score = 0;
  
  // Verified skills (max 30 points)
  if (skills.total > 0) {
    const verifiedRatio = skills.verified / skills.total;
    score += verifiedRatio * 30;
  }
  
  // Skill tests passed (max 20 points)
  score += Math.min(skills.testsPassed * 5, 20);
  
  // Endorsements (max 20 points)
  score += Math.min(skills.endorsements * 2, 20);
  
  // Average skill level (max 30 points)
  const levelScore = (skills.averageLevel / 4) * 30;
  score += levelScore;
  
  return Math.min(score, 100);
}

/**
 * Calculate project score component
 */
function calculateProjectScore(projects: TrustScoreFactors['projects']): number {
  let score = 0;
  
  // Completed projects (max 30 points)
  score += Math.min(projects.completed * 5, 30);
  
  // On-time delivery (max 25 points)
  if (projects.completed > 0) {
    const onTimeRatio = projects.onTime / projects.completed;
    score += onTimeRatio * 25;
  }
  
  // Positive reviews (max 25 points)
  if (projects.totalReviews > 0) {
    const positiveRatio = projects.positiveReviews / projects.totalReviews;
    score += positiveRatio * 25;
  }
  
  // Total earnings (max 20 points)
  const earningsScore = Math.min(projects.totalEarned / 10000, 20); // ₹10k per point
  score += earningsScore;
  
  return Math.min(score, 100);
}

/**
 * Calculate activity score component
 */
function calculateActivityScore(activity: TrustScoreFactors['activity']): number {
  let score = 0;
  
  // Days active (max 25 points)
  score += Math.min(activity.daysActive * 0.5, 25);
  
  // Profile completeness (max 25 points)
  score += (activity.profileCompleteness / 100) * 25;
  
  // Response rate (max 25 points)
  score += (activity.responseRate / 100) * 25;
  
  // Community engagement (max 25 points)
  const engagementScore = (activity.communityPosts * 0.5) + (activity.helpfulVotes * 0.2);
  score += Math.min(engagementScore, 25);
  
  return Math.min(score, 100);
}

/**
 * Calculate verification score component
 */
function calculateVerificationScore(verification: TrustScoreFactors['verification']): number {
  let score = 0;
  const verificationPoints = {
    email: 25,
    phone: 20,
    id: 20,
    linkedin: 15,
    github: 10,
    paymentMethod: 10,
  };
  
  if (verification.email) score += verificationPoints.email;
  if (verification.phone) score += verificationPoints.phone;
  if (verification.id) score += verificationPoints.id;
  if (verification.linkedin) score += verificationPoints.linkedin;
  if (verification.github) score += verificationPoints.github;
  if (verification.paymentMethod) score += verificationPoints.paymentMethod;
  
  return score;
}

/**
 * Get trust score tier
 */
export function getTrustScoreTier(score: number): {
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  label: string;
  color: string;
} {
  if (score >= 80) {
    return {
      tier: 'expert',
      label: 'Expert',
      color: 'text-green-600',
    };
  }
  if (score >= 60) {
    return {
      tier: 'advanced',
      label: 'Advanced',
      color: 'text-blue-600',
    };
  }
  if (score >= 40) {
    return {
      tier: 'intermediate',
      label: 'Intermediate',
      color: 'text-yellow-600',
    };
  }
  return {
    tier: 'beginner',
    label: 'Beginner',
    color: 'text-charcoal-600',
  };
}

/**
 * Get trust score improvement suggestions
 */
export function getImprovementSuggestions(
  factors: TrustScoreFactors,
  currentScore: number
): string[] {
  const suggestions: string[] = [];
  const breakdown = calculateTrustScore(factors);
  
  // Skill suggestions
  if (breakdown.skills < 70) {
    const unverifiedSkills = factors.skills.total - factors.skills.verified;
    if (unverifiedSkills > 0) {
      suggestions.push(`Complete assessments for ${unverifiedSkills} unverified skills to boost your score`);
    }
    if (factors.skills.testsPassed < 5) {
      suggestions.push('Take more skill assessments to demonstrate expertise');
    }
  }
  
  // Project suggestions
  if (breakdown.projects < 60) {
    if (factors.projects.completed < 5) {
      suggestions.push('Complete more projects to build your portfolio');
    }
    if (factors.projects.onTime < factors.projects.completed) {
      suggestions.push('Focus on delivering projects on time');
    }
  }
  
  // Activity suggestions
  if (breakdown.activity < 50) {
    if (factors.activity.profileCompleteness < 100) {
      suggestions.push('Complete your profile to 100%');
    }
    if (factors.activity.responseRate < 90) {
      suggestions.push('Maintain a high response rate to messages');
    }
    if (factors.activity.communityPosts < 5) {
      suggestions.push('Be more active in the community - post and comment');
    }
  }
  
  // Verification suggestions
  if (breakdown.verification < 80) {
    const unverified: string[] = [];
    if (!factors.verification.phone) unverified.push('Phone');
    if (!factors.verification.id) unverified.push('Government ID');
    if (!factors.verification.linkedin) unverified.push('LinkedIn');
    if (!factors.verification.github) unverified.push('GitHub');
    
    if (unverified.length > 0) {
      suggestions.push(`Verify your ${unverified.join(', ')} to increase trust score`);
    }
  }
  
  return suggestions;
}

/**
 * Calculate trust score change
 */
export function calculateTrustScoreChange(
  oldScore: number,
  newScore: number
): {
  change: number;
  percentage: number;
  direction: 'up' | 'down' | 'same';
} {
  const change = newScore - oldScore;
  const percentage = oldScore > 0 ? (change / oldScore) * 100 : 0;
  
  return {
    change,
    percentage,
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
  };
}

/**
 * Get trust score color class
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-blue-600 bg-blue-100';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100';
  return 'text-charcoal-600 bg-charcoal-100';
}

/**
 * Get trust score badge
 */
export function getTrustScoreBadge(score: number): string {
  if (score >= 80) return '🏆 Expert';
  if (score >= 60) return '⭐ Advanced';
  if (score >= 40) return '📈 Intermediate';
  return '🌱 Beginner';
}

/**
 * Calculate profile completeness percentage
 */
export function calculateProfileCompleteness(profile: {
  name?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  phone?: string;
  skills?: any[];
  socialLinks?: Record<string, string>;
  education?: any[];
  experience?: any[];
}): number {
  const fields = [
    'name',
    'bio',
    'avatar',
    'location',
    'phone',
  ];
  
  const arrayFields = [
    'skills',
    'socialLinks',
    'education',
    'experience',
  ];
  
  let completed = 0;
  let total = fields.length + arrayFields.length;
  
  // Check basic fields
  fields.forEach(field => {
    if (profile[field as keyof typeof profile]) completed++;
  });
  
  // Check array fields
  if (profile.skills && profile.skills.length > 0) completed++;
  if (profile.socialLinks && Object.keys(profile.socialLinks).length > 0) completed++;
  if (profile.education && profile.education.length > 0) completed++;
  if (profile.experience && profile.experience.length > 0) completed++;
  
  return Math.round((completed / total) * 100);
}

/**
 * Calculate response rate
 */
export function calculateResponseRate(
  messagesReceived: number,
  messagesResponded: number,
  timeWindow: number = 24 // hours
): number {
  if (messagesReceived === 0) return 100;
  return Math.round((messagesResponded / messagesReceived) * 100);
}

/**
 * Calculate on-time delivery rate
 */
export function calculateOnTimeDelivery(
  projectsCompleted: number,
  projectsOnTime: number
): number {
  if (projectsCompleted === 0) return 0;
  return Math.round((projectsOnTime / projectsCompleted) * 100);
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Format trust score for display
 */
export function formatTrustScore(score: number): string {
  return `${score}%`;
}

/**
 * Get trust score progress bar color
 */
export function getProgressBarColor(score: number): string {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-blue-600';
  if (score >= 40) return 'bg-yellow-600';
  return 'bg-charcoal-600';
}

/**
 * Calculate required score for next tier
 */
export function getNextTierRequirement(score: number): {
  nextTier: string;
  pointsNeeded: number;
} {
  if (score < 40) {
    return {
      nextTier: 'Intermediate',
      pointsNeeded: 40 - score,
    };
  }
  if (score < 60) {
    return {
      nextTier: 'Advanced',
      pointsNeeded: 60 - score,
    };
  }
  if (score < 80) {
    return {
      nextTier: 'Expert',
      pointsNeeded: 80 - score,
    };
  }
  return {
    nextTier: 'Max',
    pointsNeeded: 0,
  };
}

/**
 * Trust Score history tracker
 */
export class TrustScoreTracker {
  private history: TrustScoreHistory[] = [];
  private currentScore: number = 0;

  constructor(initialScore: number = 0) {
    this.currentScore = initialScore;
    this.addHistory(initialScore, 'Initial score');
  }

  /**
   * Update trust score with reason
   */
  updateScore(newScore: number, reason: string): void {
    this.currentScore = newScore;
    this.addHistory(newScore, reason);
  }

  /**
   * Add score to history
   */
  private addHistory(score: number, reason: string): void {
    this.history.push({
      date: new Date(),
      score,
      reason,
    });
  }

  /**
   * Get score history
   */
  getHistory(limit?: number): TrustScoreHistory[] {
    const sorted = [...this.history].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get trend over period
   */
  getTrend(days: number = 30): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentHistory = this.history.filter(h => h.date >= cutoff);
    if (recentHistory.length < 2) return 0;
    
    const oldest = recentHistory[recentHistory.length - 1].score;
    const newest = recentHistory[0].score;
    
    return newest - oldest;
  }

  /**
   * Get current score
   */
  getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.history = [];
    this.currentScore = 0;
  }
}
