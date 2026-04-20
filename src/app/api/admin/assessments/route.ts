import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import Assessment from '@/lib/db/models/assessment';
import { z } from 'zod';

const questionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctAnswer: z.number().min(0),
  explanation: z.string().optional(),
  points: z.number().min(1).default(1),
});

const badgeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  requiredScore: z.number().min(0).max(100).default(90),
});

const assessmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  skillName: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  price: z.number().min(0).default(0),
  duration: z.number().min(5).max(180),
  passingScore: z.number().min(50).max(90).default(70),
  questions: z.array(questionSchema).min(1),
  badges: z.array(badgeSchema).optional(),
  prerequisites: z.array(z.string()).optional(),
  tags: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const validation = assessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const assessment = await Assessment.create({
      ...validation.data,
      tags: validation.data.tags ? validation.data.tags.split(',').map(t => t.trim()) : [],
      createdBy: session.user.id,
      isActive: true,
      totalAttempts: 0,
      passRate: 0,
      averageScore: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Assessment created successfully',
      assessment: {
        id: assessment._id,
        title: assessment.title,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const assessments = await Assessment.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      assessments: assessments.map(a => ({
        id: a._id,
        title: a.title,
        skillName: a.skillName,
        level: a.level,
        price: a.price,
        duration: a.duration,
        totalAttempts: a.totalAttempts,
        passRate: a.passRate,
        status: a.isActive ? 'active' : 'draft',
        createdAt: a.createdAt,
        revenue: a.totalAttempts * a.price,
      })),
    });

  } catch (error) {
    console.error('Get assessments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}