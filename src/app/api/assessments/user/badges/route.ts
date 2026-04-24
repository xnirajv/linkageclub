import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('badges skills')
      .lean();

    const badges = {
      earned: user?.badges || [],
      verifiedSkills: user?.skills?.filter((s: any) => s.verified) || [],
      totalBadges: user?.badges?.length || 0,
      totalSkills: user?.skills?.filter((s: any) => s.verified)?.length || 0,
    };

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}