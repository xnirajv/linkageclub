import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment, { IAssessment } from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

// Define a type for the assessment with optional userAttempt
type AssessmentWithUserAttempt = any; // Or define a proper interface

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    // Use .lean() to get a plain JavaScript object directly
    const assessment = await Assessment.findById(params.id).lean();

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // assessment is already a plain object, no need for toObject()
    const assessmentObj = assessment as AssessmentWithUserAttempt;

    // Check if user has attempted this assessment
    if (session) {
      const userAttempt = assessment.attempts?.find(
        (a: any) => a.userId?.toString() === session.user.id
      );

      if (userAttempt) {
        // Add user attempt to the response
        assessmentObj.userAttempt = userAttempt;
        
        // If user has already attempted, don't send correct answers
        if (assessmentObj.questions) {
          assessmentObj.questions = assessmentObj.questions.map((q: any) => {
            const { correctAnswer, ...questionWithoutCorrect } = q;
            return questionWithoutCorrect;
          });
        }
      } else {
        // User hasn't attempted yet, still don't send correct answers
        if (assessmentObj.questions) {
          assessmentObj.questions = assessmentObj.questions.map((q: any) => {
            const { correctAnswer, ...questionWithoutCorrect } = q;
            return questionWithoutCorrect;
          });
        }
      }
    } else {
      // No session (public view), don't send correct answers
      if (assessmentObj.questions) {
        assessmentObj.questions = assessmentObj.questions.map((q: any) => {
          const { correctAnswer, ...questionWithoutCorrect } = q;
          return questionWithoutCorrect;
        });
      }
    }

    return NextResponse.json({ assessment: assessmentObj });
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
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const assessment = await Assessment.findById(params.id) as IAssessment | null;

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Soft delete
    assessment.isActive = false;
    await (assessment as any).save();

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