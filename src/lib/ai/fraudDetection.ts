import { IUser } from '@/types/user';
import { IProject } from '@/types/project';
import { IApplication } from '@/types/application';
import { IPayment } from '@/types/payment';

export interface FraudScore {
  score: number; // 0-100, higher = more suspicious
  risk: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
}

/**
 * Detect fraudulent user behavior
 */
export function detectUserFraud(user: IUser, recentActivity?: any): FraudScore {
  const flags: string[] = [];
  let score = 0;

  // Check account age
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);

  if (daysOld < 1) {
    score += 20;
    flags.push('Very new account (less than 1 day old)');
  }

  // Check email verification
  if (!user.emailVerified) {
    score += 15;
    flags.push('Email not verified');
  }

  // Check trust score
  if (user.trustScore < 20) {
    score += 25;
    flags.push('Very low trust score');
  }

  // Check profile completeness
  const profileFields = [user.bio, user.location, user.phone, user.avatar];
  const completedFields = profileFields.filter(Boolean).length;
  if (completedFields < 2) {
    score += 15;
    flags.push('Incomplete profile');
  }

  // Check verification status
  const verifications = Object.values(user.verification || {});
  const verifiedCount = verifications.filter(Boolean).length;
  if (verifiedCount === 0) {
    score += 15;
    flags.push('No verifications completed');
  }

  // Check for suspicious patterns
  if (user.stats) {
    // Too many applications in short time
    if (recentActivity?.applicationsLast24h > 20) {
      score += 20;
      flags.push('Excessive applications in 24 hours');
    }

    // High rejection rate
    const rejectionRate = user.stats.projectsCompleted > 0
      ? (user.stats.projectsCompleted / (user.stats.projectsCompleted + 10)) * 100
      : 0;
    
    if (rejectionRate > 80) {
      score += 15;
      flags.push('High application rejection rate');
    }
  }

  const recommendations = generateRecommendations(flags);

  return {
    score: Math.min(score, 100),
    risk: getRiskLevel(score),
    flags,
    recommendations,
  };
}

/**
 * Detect fraudulent project postings
 */
export function detectProjectFraud(project: IProject, poster: IUser): FraudScore {
  const flags: string[] = [];
  let score = 0;

  // Check poster's account age
  const accountAge = Date.now() - new Date(poster.createdAt).getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);

  if (daysOld < 3) {
    score += 20;
    flags.push('Posted by very new account');
  }

  // Check for unrealistic budget
  if (project.budget) {
    const avgBudget = (project.budget.min + project.budget.max) / 2;
    
    if (avgBudget < 1000 && project.duration > 30) {
      score += 25;
      flags.push('Unrealistically low budget for duration');
    }

    if (avgBudget > 10000000) {
      score += 30;
      flags.push('Suspiciously high budget');
    }
  }

  // Check description quality
  if (project.description) {
    const wordCount = project.description.split(/\s+/).length;
    
    if (wordCount < 20) {
      score += 15;
      flags.push('Very short description');
    }

    // Check for spam patterns
    const spamKeywords = ['guaranteed', 'risk-free', 'easy money', 'act now', 'limited time'];
    const hasSpam = spamKeywords.some(keyword => 
      project.description.toLowerCase().includes(keyword)
    );
    
    if (hasSpam) {
      score += 25;
      flags.push('Contains spam keywords');
    }
  }

  // Check for duplicate content
  if (project.title && project.title.length > 50) {
    score += 10;
    flags.push('Unusually long title');
  }

  // Check poster's trust score
  if (poster.trustScore < 30) {
    score += 20;
    flags.push('Posted by low trust score user');
  }

  const recommendations = generateRecommendations(flags);

  return {
    score: Math.min(score, 100),
    risk: getRiskLevel(score),
    flags,
    recommendations,
  };
}

/**
 * Detect fraudulent applications
 */
export function detectApplicationFraud(
  application: IApplication,
  applicant: IUser,
  project: IProject
): FraudScore {
  const flags: string[] = [];
  let score = 0;

  // Check applicant's trust score
  if (applicant.trustScore < 20) {
    score += 25;
    flags.push('Applicant has very low trust score');
  }

  // Check cover letter quality
  if (application.coverLetter) {
    const wordCount = application.coverLetter.split(/\s+/).length;
    
    if (wordCount < 10) {
      score += 20;
      flags.push('Very short cover letter');
    }

    // Check for generic content
    const genericPhrases = [
      'i am interested',
      'please consider',
      'i would like to apply',
      'dear sir/madam',
    ];
    
    const hasGeneric = genericPhrases.some(phrase =>
      application.coverLetter!.toLowerCase().includes(phrase)
    );

    if (hasGeneric && wordCount < 50) {
      score += 15;
      flags.push('Generic cover letter');
    }
  }

  // Check for skill mismatch
  if (applicant.skills && project.skills) {
    const applicantSkills = applicant.skills.map(s => s.name.toLowerCase());
    const requiredSkills = project.skills
      .filter(s => s.mandatory)
      .map(s => s.name.toLowerCase());
    
    const hasRequired = requiredSkills.every(skill =>
      applicantSkills.includes(skill)
    );

    if (!hasRequired) {
      score += 20;
      flags.push('Missing mandatory skills');
    }
  }

  // Check application timing
  const applicationAge = Date.now() - new Date(application.createdAt).getTime();
  const minutesOld = applicationAge / (1000 * 60);

  if (minutesOld < 5) {
    score += 10;
    flags.push('Applied very quickly after project posting');
  }

  const recommendations = generateRecommendations(flags);

  return {
    score: Math.min(score, 100),
    risk: getRiskLevel(score),
    flags,
    recommendations,
  };
}

/**
 * Detect fraudulent payment activity
 */
export function detectPaymentFraud(payment: IPayment, user: IUser): FraudScore {
  const flags: string[] = [];
  let score = 0;

  // Check user's trust score
  if (user.trustScore < 30) {
    score += 25;
    flags.push('User has low trust score');
  }

  // Check payment amount
  if (payment.amount > 500000) {
    score += 20;
    flags.push('Large payment amount');
  }

  // Check for rapid transactions
  // This would require checking recent payment history
  // Placeholder for now
  
  // Check user verification
  const verifications = Object.values(user.verification || {});
  const verifiedCount = verifications.filter(Boolean).length;
  
  if (verifiedCount < 2) {
    score += 20;
    flags.push('Insufficient user verifications');
  }

  // Check account age
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);

  if (daysOld < 7 && payment.amount > 50000) {
    score += 30;
    flags.push('Large payment from new account');
  }

  const recommendations = generateRecommendations(flags);

  return {
    score: Math.min(score, 100),
    risk: getRiskLevel(score),
    flags,
    recommendations,
  };
}

/**
 * Get risk level based on score
 */
function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Generate recommendations based on flags
 */
function generateRecommendations(flags: string[]): string[] {
  const recommendations: string[] = [];

  if (flags.some(f => f.includes('verification') || f.includes('verified'))) {
    recommendations.push('Require additional verification before proceeding');
  }

  if (flags.some(f => f.includes('trust score'))) {
    recommendations.push('Monitor activity closely');
  }

  if (flags.some(f => f.includes('new account'))) {
    recommendations.push('Apply stricter limits for new accounts');
  }

  if (flags.some(f => f.includes('budget') || f.includes('payment'))) {
    recommendations.push('Request payment verification or escrow');
  }

  if (flags.some(f => f.includes('spam') || f.includes('generic'))) {
    recommendations.push('Flag for manual review');
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring');
  }

  return recommendations;
}

export default {
  detectUserFraud,
  detectProjectFraud,
  detectApplicationFraud,
  detectPaymentFraud,
};