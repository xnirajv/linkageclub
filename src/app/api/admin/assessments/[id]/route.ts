import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Update allowed fields
    if (body.title) assessment.title = body.title;
    if (body.description) assessment.description = body.description;
    if (body.skillName) assessment.skillName = body.skillName;
    if (body.level) assessment.level = body.level;
    if (body.price !== undefined) assessment.price = body.price;
    if (body.duration) assessment.duration = body.duration;
    if (body.passingScore) assessment.passingScore = body.passingScore;
    if (body.isActive !== undefined) assessment.isActive = body.isActive;
    
    // Commented out - properties may not exist in schema
    // if (body.tags) assessment.tags = body.tags;
    // if (body.badges) assessment.badges = body.badges;
    // if (body.prerequisites) assessment.prerequisites = body.prerequisites;

    await assessment.save();

    return NextResponse.json({ success: true, message: 'Assessment updated successfully' });
    
  } catch (error) {
    console.error('Update assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Soft delete
    assessment.isActive = false;
    await assessment.save();

    return NextResponse.json({ success: true, message: 'Assessment deleted successfully' });
    
  } catch (error) {
    console.error('Delete assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const assessment = await Assessment.findById(id).lean();
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Remove correctAnswer from questions for security
    if (assessment.questions) {
      assessment.questions = assessment.questions.map((q: any) => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
    }

    return NextResponse.json({ success: true, assessment });
    
  } catch (error) {
    console.error('Get assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}