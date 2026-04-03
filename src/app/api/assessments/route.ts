import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose';

// Define interfaces for better type safety
interface IAttempt {
  userId: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  passed: boolean;
  timeSpent: number;
  startedAt: Date;
  completedAt: Date | null;
}

interface IAssessment {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  skillName: string;
  level: string;
  price: number;
  duration: number;
  passingScore: number;
  questions: Array<{
    question: string;
    options: string[];
    points: number;
    // correctAnswer is excluded in select
  }>;
  attempts: IAttempt[];
  isActive: boolean;
  createdAt: Date;
}

// Extended type for assessment with optional userAttempt
type AssessmentWithUserAttempt = IAssessment & {
  userAttempt?: IAttempt;
};

const assessmentSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(2000),
  skillName: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  price: z.number().min(0),
  duration: z.number().min(5).max(180),
  passingScore: z.number().min(50).max(90),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).min(2),
    correctAnswer: z.number().min(0),
    explanation: z.string().optional(),
    points: z.number().min(1).default(1),
  })).min(1),
  badges: z.array(z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    requiredScore: z.number(),
  })).optional(),
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skill = searchParams.get('skill');
    const level = searchParams.get('level');
    const price = searchParams.get('price'); // free, paid, all
    const search = searchParams.get('search');

    const query: any = { isActive: true };

    if (skill) {
      query.skillName = skill;
    }

    if (level) {
      query.level = level;
    }

    if (price === 'free') {
      query.price = 0;
    } else if (price === 'paid') {
      query.price = { $gt: 0 };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const assessments = await Assessment.find(query)
      .select('-questions.correctAnswer') // Don't send correct answers
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() to get plain JavaScript objects

    const total = await Assessment.countDocuments(query);

    // Get user's completed assessments if logged in
    const session = await getServerSession(authOptions);
    
    let assessmentsWithStatus: AssessmentWithUserAttempt[] = [];

    if (session) {
      // Find all assessments where this user has attempts
      const userAssessmentIds = await Assessment.distinct('_id', {
        'attempts.userId': session.user.id,
      });

      // For each assessment, find the user's latest attempt
      assessmentsWithStatus = await Promise.all(
        assessments.map(async (assessment: any) => {
          const assessmentWithStatus: AssessmentWithUserAttempt = { ...assessment };
          
          if (userAssessmentIds.some(id => id.toString() === assessment._id.toString())) {
            // Find the user's attempt for this assessment
            const assessmentWithAttempts = await Assessment.findOne(
              { 
                _id: assessment._id,
                'attempts.userId': session.user.id 
              },
              { 
                'attempts.$': 1 // Only return the matching attempt
              }
            ).lean();
            
            if (assessmentWithAttempts && assessmentWithAttempts.attempts && assessmentWithAttempts.attempts.length > 0) {
              assessmentWithStatus.userAttempt = assessmentWithAttempts.attempts[0] as IAttempt;
            }
          }
          
          return assessmentWithStatus;
        })
      );
    } else {
      // No user session, just return assessments without userAttempt
      assessmentsWithStatus = assessments.map((assessment: any) => ({ ...assessment }));
    }

    return NextResponse.json({
      assessments: assessmentsWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create assessments' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = assessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const assessment = await Assessment.create({
      ...validation.data,
      createdBy: session.user.id,
      totalAttempts: 0,
      passRate: 0,
      averageScore: 0,
    });

    return NextResponse.json({
      message: 'Assessment created successfully',
      assessment,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}