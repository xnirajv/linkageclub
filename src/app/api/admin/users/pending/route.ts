import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get users pending verification (companies, mentors)
    const pendingCompanies = await User.find({
      role: 'company',
      isVerified: false,
      emailVerified: true,
    }).select('name email createdAt');

    const pendingMentors = await User.find({
      role: 'mentor',
      isVerified: false,
      emailVerified: true,
    }).select('name email createdAt');

    return NextResponse.json({
      companies: pendingCompanies,
      mentors: pendingMentors,
      total: pendingCompanies.length + pendingMentors.length,
    });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}