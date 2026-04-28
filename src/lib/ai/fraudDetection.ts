import type { IUser } from '@/types/user';
import type { Project } from '@/types/project';
import type { IApplication } from '@/types/application';
import type { IPayment } from '@/types/payment';

export interface FraudScore {
  score: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
}

export function detectUserFraud(user: IUser, recentActivity?: any): FraudScore {
  const flags: string[] = [];
  let score = 0;

  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);

  if (daysOld < 1) { score += 20; flags.push('Very new account (less than 1 day old)'); }
  if (!user.emailVerified) { score += 15; flags.push('Email not verified'); }
  if (user.trustScore < 20) { score += 25; flags.push('Very low trust score'); }

  const profileFields = [user.bio, user.location, user.phone, user.avatar];
  const completedFields = profileFields.filter(Boolean).length;
  if (completedFields < 2) { score += 15; flags.push('Incomplete profile'); }

  const verifications = Object.values(user.verification || {});
  const verifiedCount = verifications.filter(Boolean).length;
  if (verifiedCount === 0) { score += 15; flags.push('No verifications completed'); }

  if (user.stats) {
    if (recentActivity?.applicationsLast24h > 20) { score += 20; flags.push('Excessive applications in 24 hours'); }
    const rejectionRate = user.stats.projectsCompleted > 0
      ? (user.stats.projectsCompleted / (user.stats.projectsCompleted + 10)) * 100 : 0;
    if (rejectionRate > 80) { score += 15; flags.push('High application rejection rate'); }
  }

  return { score: Math.min(score, 100), risk: getRiskLevel(score), flags, recommendations: generateRecommendations(flags) };
}

export function detectProjectFraud(project: Project, poster: IUser): FraudScore {
  const flags: string[] = [];
  let score = 0;

  const accountAge = Date.now() - new Date(poster.createdAt).getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);
  if (daysOld < 3) { score += 20; flags.push('Posted by very new account'); }

  if (project.budget) {
    const avgBudget = (project.budget.min + project.budget.max) / 2;
    if (avgBudget < 1000 && project.duration > 30) { score += 25; flags.push('Unrealistically low budget for duration'); }
    if (avgBudget > 10000000) { score += 30; flags.push('Suspiciously high budget'); }
  }

  if (project.description) {
    const wordCount = project.description.split(/\s+/).length;
    if (wordCount < 20) { score += 15; flags.push('Very short description'); }
    const spamKeywords = ['guaranteed', 'risk-free', 'easy money', 'act now', 'limited time'];
    if (spamKeywords.some(k => project.description.toLowerCase().includes(k))) { score += 25; flags.push('Contains spam keywords'); }
  }

  if (project.title && project.title.length > 50) { score += 10; flags.push('Unusually long title'); }
  if (poster.trustScore < 30) { score += 20; flags.push('Posted by low trust score user'); }

  return { score: Math.min(score, 100), risk: getRiskLevel(score), flags, recommendations: generateRecommendations(flags) };
}

export function detectApplicationFraud(application: IApplication, applicant: IUser, project: Project): FraudScore {
  const flags: string[] = [];
  let score = 0;

  if (applicant.trustScore < 20) { score += 25; flags.push('Applicant has very low trust score'); }

  if (application.coverLetter) {
    const wordCount = application.coverLetter.split(/\s+/).length;
    if (wordCount < 10) { score += 20; flags.push('Very short cover letter'); }
    const genericPhrases = ['i am interested', 'please consider', 'i would like to apply', 'dear sir/madam'];
    if (genericPhrases.some(p => application.coverLetter!.toLowerCase().includes(p)) && wordCount < 50) { score += 15; flags.push('Generic cover letter'); }
  }

  if (applicant.skills && project.skills) {
    const applicantSkills = applicant.skills.map((s: any) => (s.name || s).toLowerCase());
    const requiredSkills = project.skills.filter(s => s.mandatory).map(s => s.name.toLowerCase());
    if (!requiredSkills.every(skill => applicantSkills.includes(skill))) { score += 20; flags.push('Missing mandatory skills'); }
  }

  const applicationAge = Date.now() - new Date(application.createdAt).getTime();
  if (applicationAge / (1000 * 60) < 5) { score += 10; flags.push('Applied very quickly after project posting'); }

  return { score: Math.min(score, 100), risk: getRiskLevel(score), flags, recommendations: generateRecommendations(flags) };
}

export function detectPaymentFraud(payment: IPayment, user: IUser): FraudScore {
  const flags: string[] = [];
  let score = 0;

  if (user.trustScore < 30) { score += 25; flags.push('User has low trust score'); }
  if (payment.amount > 500000) { score += 20; flags.push('Large payment amount'); }

  const verifications = Object.values(user.verification || {});
  if (verifications.filter(Boolean).length < 2) { score += 20; flags.push('Insufficient user verifications'); }

  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  if (accountAge / (1000 * 60 * 60 * 24) < 7 && payment.amount > 50000) { score += 30; flags.push('Large payment from new account'); }

  return { score: Math.min(score, 100), risk: getRiskLevel(score), flags, recommendations: generateRecommendations(flags) };
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function generateRecommendations(flags: string[]): string[] {
  const recommendations: string[] = [];
  if (flags.some(f => f.includes('verification') || f.includes('verified'))) recommendations.push('Require additional verification');
  if (flags.some(f => f.includes('trust score'))) recommendations.push('Monitor activity closely');
  if (flags.some(f => f.includes('new account'))) recommendations.push('Apply stricter limits for new accounts');
  if (flags.some(f => f.includes('budget') || f.includes('payment'))) recommendations.push('Request payment verification or escrow');
  if (flags.some(f => f.includes('spam') || f.includes('generic'))) recommendations.push('Flag for manual review');
  if (recommendations.length === 0) recommendations.push('Continue monitoring');
  return recommendations;
}

export default { detectUserFraud, detectProjectFraud, detectApplicationFraud, detectPaymentFraud };