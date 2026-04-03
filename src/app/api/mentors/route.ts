import { NextRequest, NextResponse } from 'next/server';
import Mentor from '@/lib/db/models/mentor';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const expertise = searchParams.getAll('expertise');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '10000');
    const rating = parseFloat(searchParams.get('rating') || '0');
    const availability = searchParams.get('availability');
    const search = searchParams.get('search');

    const query: any = { isActive: true, isVerified: true };

    if (expertise.length > 0) {
      query['expertise.skill'] = { $in: expertise };
    }

    if (minPrice || maxPrice) {
      query.hourlyRate = { $gte: minPrice, $lte: maxPrice };
    }

    if (rating > 0) {
      query['stats.averageRating'] = { $gte: rating };
    }

    if (availability) {
      query['availability.type'] = availability;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } },
        ],
        role: 'mentor',
      }).select('_id');

      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    const skip = (page - 1) * limit;

    const mentors = await Mentor.find(query)
      .populate('userId', 'name avatar bio location')
      .sort({ 'stats.averageRating': -1, 'stats.completedSessions': -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mentor.countDocuments(query);

    return NextResponse.json({
      mentors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}