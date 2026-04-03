import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') || 'all'; // student, mentor, founder, company, all
    const skills = searchParams.getAll('skills');
    const location = searchParams.get('location');
    const minTrustScore = parseInt(searchParams.get('minTrustScore') || '0');
    const verified = searchParams.get('verified') === 'true';
    const availability = searchParams.get('availability'); // for mentors

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchRegex = new RegExp(q, 'i');
    
    // Build user query
    const userQuery: any = {};
    
    if (role !== 'all') {
      userQuery.role = role;
    }

    userQuery.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { bio: searchRegex },
      { location: searchRegex },
      { 'skills.name': searchRegex },
    ];

    if (location) {
      userQuery.location = { $regex: location, $options: 'i' };
    }

    if (skills.length > 0) {
      userQuery['skills.name'] = { $in: skills };
    }

    if (minTrustScore > 0) {
      userQuery.trustScore = { $gte: minTrustScore };
    }

    if (verified) {
      userQuery.isVerified = true;
    }

    const skip = (page - 1) * limit;

    // Execute main user search
    const users = await User.aggregate([
      { $match: userQuery },
      {
        $addFields: {
          nameMatch: { $regexMatch: { input: '$name', regex: searchRegex } },
          emailMatch: { $regexMatch: { input: '$email', regex: searchRegex } },
          bioMatch: { $regexMatch: { input: '$bio', regex: searchRegex } },
          locationMatch: { $regexMatch: { input: '$location', regex: searchRegex } },
          skillMatches: {
            $size: {
              $filter: {
                input: '$skills',
                as: 'skill',
                cond: { $regexMatch: { input: '$$skill.name', regex: searchRegex } },
              },
            },
          },
        },
      },
      {
        $addFields: {
          relevanceScore: {
            $add: [
              { $multiply: [{ $cond: ['$nameMatch', 10, 0] }, 1] },
              { $multiply: [{ $cond: ['$emailMatch', 5, 0] }, 1] },
              { $multiply: [{ $cond: ['$locationMatch', 3, 0] }, 1] },
              { $multiply: [{ $cond: ['$bioMatch', 2, 0] }, 1] },
              { $multiply: ['$skillMatches', 2] },
            ],
          },
        },
      },
      { $sort: { relevanceScore: -1, trustScore: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          password: 0,
          emailVerificationToken: 0,
          resetPasswordToken: 0,
        },
      },
    ]);

    // For mentors, fetch additional mentor data
    let usersWithMentorData = users;
    if (role === 'mentor' || role === 'all') {
      const mentorUserIds = users
        .filter(u => u.role === 'mentor')
        .map(u => u._id);

      if (mentorUserIds.length > 0) {
        let mentorQuery: any = { userId: { $in: mentorUserIds } };
        
        if (availability) {
          mentorQuery['availability.type'] = availability;
        }

        const mentorData = await Mentor.find(mentorQuery)
          .select('hourlyRate availability stats expertise')
          .lean();

        const mentorMap = mentorData.reduce((map: any, mentor: any) => {
          map[mentor.userId.toString()] = mentor;
          return map;
        }, {});

        usersWithMentorData = users.map((user: any) => {
          if (user.role === 'mentor') {
            return { ...user, mentorProfile: mentorMap[user._id.toString()] };
          }
          return user;
        });
      }
    }

    // Get total count
    const total = await User.countDocuments(userQuery);

    // Get facet counts for filters
    const facets = await User.aggregate([
      { $match: userQuery },
      {
        $facet: {
          roles: [
            { $group: { _id: '$role', count: { $sum: 1 } } },
          ],
          locations: [
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          skills: [
            { $unwind: '$skills' },
            { $group: { _id: '$skills.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          trustScoreRanges: [
            {
              $bucket: {
                groupBy: '$trustScore',
                boundaries: [0, 30, 60, 80, 90, 100],
                default: '0-30',
                output: { count: { $sum: 1 } },
              },
            },
          ],
          verifiedCount: [
            { $match: { isVerified: true } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    return NextResponse.json({
      users: usersWithMentorData,
      facets: facets[0],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}