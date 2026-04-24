import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skill = searchParams.get('skill');
    const level = searchParams.get('level');
    const price = searchParams.get('price');
    const search = searchParams.get('search');

    const query: any = { isActive: true };

    if (skill && skill !== 'all') query.skillName = skill;
    if (level && level !== 'all') query.level = level;
    if (price === 'free') query.price = 0;
    else if (price === 'paid') query.price = { $gt: 0 };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skillName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [assessments, total] = await Promise.all([
      Assessment.find(query)
        .select('-questions.correctAnswer')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assessment.countDocuments(query),
    ]);

    const session = await getServerSession(authOptions);
    let userAttemptsMap = new Map();

    if (session) {
      const userAssessments = await Assessment.find(
        { 'attempts.userId': session.user.id, isActive: true },
        { _id: 1, attempts: { $elemMatch: { userId: session.user.id } } }
      ).lean();
      
      userAssessments.forEach((a: any) => {
        const attempt = a.attempts?.[0];
        if (attempt) {
          userAttemptsMap.set(a._id.toString(), {
            score: attempt.score,
            passed: attempt.passed,
            completedAt: attempt.completedAt,
          });
        }
      });
    }

    const assessmentsWithStatus = assessments.map((a: any) => ({
      ...a,
      _id: a._id.toString(),
      userAttempt: userAttemptsMap.get(a._id.toString()) || null,
    }));

    return NextResponse.json({
      assessments: assessmentsWithStatus,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}