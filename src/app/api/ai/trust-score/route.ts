import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('trustScore skills verification stats');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate detailed breakdown
    const breakdown = {
      skills: calculateSkillScore(user.skills),
      projects: calculateProjectScore(user.stats),
      activity: calculateActivityScore(user.stats, user.lastActive),
      verification: calculateVerificationScore(user.verification),
    };

    const totalScore = Math.round(
      (breakdown.skills * 0.35) +
      (breakdown.projects * 0.3) +
      (breakdown.activity * 0.2) +
      (breakdown.verification * 0.15)
    );

    // Generate improvement suggestions
    const suggestions: string[] = [];

    if (breakdown.skills < 80) {
      const unverifiedSkills = user.skills?.filter((s: any) => !s.verified).length || 0;
      if (unverifiedSkills > 0) {
        suggestions.push(`Complete assessments for ${unverifiedSkills} unverified skills to boost your score`);
      } else {
        suggestions.push('Add more skills to your profile');
      }
    }

    if (breakdown.projects < 70) {
      suggestions.push('Complete more projects to build your portfolio');
    }

    if (breakdown.activity < 60) {
      suggestions.push('Be more active in the community - post, comment, and engage');
    }

    if (breakdown.verification < 80) {
      const unverified: string[] = [];
      if (!user.verification.email) unverified.push('Email');
      if (!user.verification.phone) unverified.push('Phone');
      if (!user.verification.linkedin) unverified.push('LinkedIn');
      if (!user.verification.github) unverified.push('GitHub');
      
      if (unverified.length > 0) {
        suggestions.push(`Verify your ${unverified.join(', ')} to increase trust score`);
      }
    }

    return NextResponse.json({
      trustScore: user.trustScore || totalScore,
      breakdown,
      suggestions,
    });
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateSkillScore(skills: any[]): number {
  if (!skills || skills.length === 0) return 0;
  
  const verifiedSkills = skills.filter(s => s.verified).length;
  
  // Each verified skill gives 15 points, up to 100
  return Math.min(verifiedSkills * 15, 100);
}

function calculateProjectScore(stats: any): number {
  if (!stats) return 0;
  
  const projectScore = Math.min(stats.projectsCompleted * 20, 60);
  const ratingScore = stats.averageRating * 8;
  
  return Math.min(projectScore + ratingScore, 100);
}

function calculateActivityScore(stats: any, lastActive: Date): number {
  if (!stats) return 0;
  
  const daysActive = stats.daysActive || 0;
  const activityScore = Math.min(daysActive, 30);
  
  const daysSinceLastActive = Math.floor(
    (new Date().getTime() - new Date(lastActive).getTime()) / (1000 * 3600 * 24)
  );
  const recencyScore = daysSinceLastActive < 7 ? 20 : 0;
  
  return Math.min(activityScore + recencyScore, 50) * 2; // Scale to 100
}

function calculateVerificationScore(verification: any): number {
  if (!verification) return 0;
  
  let score = 0;
  if (verification.email) score += 20;
  if (verification.phone) score += 20;
  if (verification.linkedin) score += 20;
  if (verification.github) score += 20;
  if (verification.id) score += 20;
  
  return score;
}
