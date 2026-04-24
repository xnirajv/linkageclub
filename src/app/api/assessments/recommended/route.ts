import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('skills');
    const userSkills = user?.skills?.map((s: any) => s.name) || [];

    const assessments = await Assessment.find({ isActive: true })
      .select('title skillName level price duration passRate badges')
      .limit(10)
      .lean();

    const recommended = assessments.map((a: any) => {
      const matchScore = userSkills.includes(a.skillName) ? 95 : 70;
      const trustBoost = Math.floor(matchScore / 10);
      
      return {
        id: a._id,
        title: a.title,
        skillName: a.skillName,
        level: a.level,
        price: a.price,
        duration: a.duration,
        passRate: a.passRate,
        matchScore,
        trustBoost,
        badgeName: a.badges?.[0]?.name || null,
      };
    });

    return NextResponse.json({ assessments: recommended.slice(0, 4) });
  } catch (error) {
    console.error('Error fetching recommended:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}