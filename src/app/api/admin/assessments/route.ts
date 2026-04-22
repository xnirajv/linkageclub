import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const assessmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  skillName: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  price: z.number().min(0).default(0),
  duration: z.number().min(5).max(180),
  passingScore: z.number().min(50).max(90).default(70),
  questions: z.array(z.object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2),
    correctAnswer: z.number().min(0),
    explanation: z.string().optional(),
    points: z.number().min(1).default(1),
  })).min(1),
  badges: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    requiredScore: z.number().min(0).max(100).default(90),
  })).optional(),
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const validation = assessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validation.error.errors 
      }, { status: 400 });
    }

    const assessment = await Assessment.create({
      ...validation.data,
      createdBy: session.user.id,
      totalAttempts: 0,
      passRate: 0,
      averageScore: 0,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment created successfully',
      assessment: { id: assessment._id, title: assessment.title } 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const query: any = {};
    if (status === 'active') query.isActive = true;
    else if (status === 'draft') query.isActive = false;

    const skip = (page - 1) * limit;
    const assessments = await Assessment.find(query)
      .select('-questions.correctAnswer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Assessment.countDocuments(query);

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
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
    
  } catch (error) {
    console.error('Get assessments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}