import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const createAssessmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  skillName: z.string().min(1, 'Skill name is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  price: z.number().min(0),
  duration: z.number().min(5).max(180),
  passingScore: z.number().min(50).max(90),
  questions: z
    .array(
      z.object({
        question: z.string().min(3, 'Question too short'),
        options: z.array(z.string()).min(2, 'At least 2 options required'),
        correctAnswer: z.number().min(0),
        explanation: z.string().optional(),
        points: z.number().min(1).default(1),
      })
    )
    .min(1, 'At least 1 question is required'),
  badges: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
        requiredScore: z.number(),
      })
    )
    .optional(),
  prerequisites: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skill = searchParams.get('skill');
    const level = searchParams.get('level');
    const price = searchParams.get('price');
    const search = searchParams.get('search');
    const excludeCompleted = searchParams.get('excludeCompleted') === 'true';

    const query: Record<string, any> = { isActive: true };

    if (skill) query.skillName = skill;
    if (level) query.level = level;

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
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const session = await getServerSession(authOptions);
    const skip = (page - 1) * limit;

    // ✅ If logged in and excludeCompleted=true, exclude completed
    if (session?.user?.id && excludeCompleted) {
      const completedIds = await Assessment.find({
        'attempts.userId': session.user.id,
        'attempts.completedAt': { $ne: null },
      }).distinct('_id');

      if (completedIds.length > 0) {
        query._id = { $nin: completedIds };
      }
    }

    const [assessments, total] = await Promise.all([
      Assessment.find(query)
        .select('-questions.correctAnswer -questions.explanation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assessment.countDocuments(query),
    ]);

    // ✅ Add user attempt - GET LATEST completed attempt
    let assessmentsWithAttempts = assessments;

    if (session?.user?.id) {
      assessmentsWithAttempts = assessments.map((assessment: any) => {
        // ✅ FIX: Get ALL completed attempts and pick LATEST by completedAt
        const userAttempts = (assessment.attempts || [])
          .filter(
            (a: any) =>
              a.userId?.toString() === session.user.id && a.completedAt
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.completedAt).getTime() -
              new Date(a.completedAt).getTime()
          );

        const latestAttempt = userAttempts[0] || null;

        return {
          ...assessment,
          userAttempt: latestAttempt
            ? {
                score: latestAttempt.score,
                passed: latestAttempt.passed,
                completedAt: latestAttempt.completedAt,
              }
            : undefined,
        };
      });
    }

    return NextResponse.json({
      assessments: assessmentsWithAttempts,
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

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create assessments' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createAssessmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    await connectDB();

    const assessment = await Assessment.create({
      ...validation.data,
      createdBy: session.user.id,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Assessment created successfully',
        assessment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}