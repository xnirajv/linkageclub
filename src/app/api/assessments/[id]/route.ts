import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const assessment = await Assessment.findById(params.id).lean();

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Remove correct answers for security
    const sanitizedAssessment = {
      ...assessment,
      questions: assessment.questions.map((q: any) => {
        const { correctAnswer, explanation, ...rest } = q;
        return rest;
      }),
    };

    // Add user attempt if logged in - ✅ GET LATEST
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      // ✅ FIX: Get all completed attempts, sort by latest
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

      return NextResponse.json({
        assessment: {
          ...sanitizedAssessment,
          userAttempt: latestAttempt
            ? {
                score: latestAttempt.score,
                passed: latestAttempt.passed,
                completedAt: latestAttempt.completedAt,
              }
            : undefined,
        },
      });
    }

    return NextResponse.json({ assessment: sanitizedAssessment });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete assessments' },
        { status: 403 }
      );
    }

    await connectDB();

    const assessment = await Assessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Soft delete
    assessment.isActive = false;
    await assessment.save();

    return NextResponse.json({
      message: 'Assessment deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
