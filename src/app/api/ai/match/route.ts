import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Project from '@/lib/db/models/project';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { projectId, jobId } = body;

    await connectDB();

    const user = await User.findById(session.user.id).select('skills trustScore stats');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let target: any;
    let type: string;

    if (projectId) {
      target = await Project.findById(projectId);
      type = 'project';
    } else if (jobId) {
      target = await Job.findById(jobId);
      type = 'job';
    } else {
      return NextResponse.json(
        { error: 'Either projectId or jobId is required' },
        { status: 400 }
      );
    }

    if (!target) {
      return NextResponse.json(
        { error: `${type} not found` },
        { status: 404 }
      );
    }

    const userSkills = user.skills?.map((s: any) => s.name) || [];
    const targetSkills = target.skills?.map((s: any) => s.name) || [];

    // Calculate skill match
    const matchingSkills = targetSkills.filter((skill: string) => 
      userSkills.includes(skill)
    );
    const skillMatchScore = targetSkills.length > 0 
      ? (matchingSkills.length / targetSkills.length) * 100 
      : 0;

    // Calculate experience match (for jobs)
    let experienceMatchScore = 100;
    if (type === 'job' && target.experience) {
      const userExp = user.stats?.projectsCompleted || 0;
      const requiredMin = target.experience.min || 0;
      const requiredMax = target.experience.max || 10;
      
      if (userExp < requiredMin) {
        experienceMatchScore = (userExp / requiredMin) * 100;
      } else if (userExp > requiredMax) {
        experienceMatchScore = Math.max(0, 100 - ((userExp - requiredMax) * 10));
      }
    }

    // Calculate budget match (for projects)
    let budgetMatchScore = 100;
    if (type === 'project' && target.budget) {
      // This would require user's expected budget range
      // For now, return 100
    }

    // Calculate trust score match
    const trustScoreMatchScore = user.trustScore || 0;

    // Calculate final match score with weights
    const matchScore = (
      (skillMatchScore * 0.5) +
      (experienceMatchScore * 0.2) +
      (budgetMatchScore * 0.15) +
      (trustScoreMatchScore * 0.15)
    );

    return NextResponse.json({
      matchScore: Math.round(matchScore),
      breakdown: {
        skillMatch: Math.round(skillMatchScore),
        experienceMatch: Math.round(experienceMatchScore),
        budgetMatch: Math.round(budgetMatchScore),
        trustScoreMatch: Math.round(trustScoreMatchScore),
      },
      matchingSkills,
      missingSkills: targetSkills.filter((skill: string) => 
        !userSkills.includes(skill)
      ),
    });
  } catch (error) {
    console.error('Error calculating match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}