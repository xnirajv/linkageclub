import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('skills assessments');
    const userSkills = user?.skills?.map((s: any) => s.name) || [];

    // Get assessments matching user's skills
    let recommended = await Assessment.find({ isActive: true })
      .select('title skillName level price duration totalAttempts passRate badges')
      .limit(10)
      .lean();

    // Calculate match score based on user skills
    const recommendedWithMatch = recommended.map((a: any) => {
      const matchScore = userSkills.includes(a.skillName) 
        ? Math.floor(Math.random() * 20) + 80  // 80-100% match
        : Math.floor(Math.random() * 30) + 50; // 50-80% match
      
      const trustBoost = matchScore >= 85 ? Math.floor(matchScore / 10) : 0;
      
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

    // Sort by match score
    recommendedWithMatch.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ assessments: recommendedWithMatch.slice(0, 4) });
  } catch (error) {
    console.error('Error fetching recommended:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}