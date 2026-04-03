import { NextRequest, NextResponse } from 'next/server';
import Mentor from '@/lib/db/models/mentor';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q');
    const expertise = searchParams.getAll('expertise');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '10000');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const availability = searchParams.get('availability');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = { isActive: true, isVerified: true };

    // Text search
    if (q) {
      const users = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { bio: { $regex: q, $options: 'i' } },
        ],
        role: 'mentor',
      }).select('_id');

      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    // Expertise filter
    if (expertise.length > 0) {
      query['expertise.skill'] = { $in: expertise };
    }

    // Price filter
    if (minPrice > 0 || maxPrice < 10000) {
      query.hourlyRate = { $gte: minPrice, $lte: maxPrice };
    }

    // Rating filter
    if (minRating > 0) {
      query['stats.averageRating'] = { $gte: minRating };
    }

    // Availability filter
    if (availability) {
      query['availability.type'] = availability;
    }

    const skip = (page - 1) * limit;

    const mentors = await Mentor.find(query)
      .populate('userId', 'name avatar bio')
      .sort({ 'stats.averageRating': -1, 'stats.completedSessions': -1 })
      .skip(skip)
      .limit(limit);

    const total = await Mentor.countDocuments(query);

    // Get facet counts for filters
    const facets = await Mentor.aggregate([
      { $match: query },
      {
        $facet: {
          expertise: [
            { $unwind: '$expertise' },
            { $group: {
              _id: '$expertise.skill',
              count: { $sum: 1 },
            }},
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: '$hourlyRate',
                boundaries: [0, 500, 1000, 1500, 2000, 3000, 5000],
                default: '5000+',
                output: {
                  count: { $sum: 1 },
                },
              },
            },
          ],
          availability: [
            { $group: {
              _id: '$availability.type',
              count: { $sum: 1 },
            }},
          ],
          ratings: [
            {
              $bucket: {
                groupBy: '$stats.averageRating',
                boundaries: [0, 2, 3, 4, 4.5, 5],
                default: '5',
                output: {
                  count: { $sum: 1 },
                },
              },
            },
          ],
        },
      },
    ]);

    return NextResponse.json({
      mentors,
      facets: facets[0],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching mentors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}