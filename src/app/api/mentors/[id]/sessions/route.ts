import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/user';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.id !== params.id && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // scheduled, completed, cancelled
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const mentor = await Mentor.findOne({ userId: params.id });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    let sessions = mentor.sessions;

    if (status) {
      sessions = sessions.filter((s: any) => s.status === status);
    }

    // Sort by date
    sessions.sort((a: any, b: any) => b.date - a.date);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedSessions = sessions.slice(skip, skip + limit);

    // Populate student details
    const populatedSessions = await Promise.all(
      paginatedSessions.map(async (session: any) => {
        const user = await User.findById(session.studentId).select('name avatar');
        return {
          ...session.toObject(),
          student: user,
        };
      })
    );

    return NextResponse.json({
      sessions: populatedSessions,
      pagination: {
        page,
        limit,
        total: sessions.length,
        pages: Math.ceil(sessions.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}