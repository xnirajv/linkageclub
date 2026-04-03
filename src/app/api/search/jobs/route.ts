import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.getAll('type');
    const location = searchParams.get('location');
    const minSalary = parseInt(searchParams.get('minSalary') || '0');
    const maxSalary = parseInt(searchParams.get('maxSalary') || '10000000');
    const experience = searchParams.get('experience');
    const skills = searchParams.getAll('skills');
    const remote = searchParams.get('remote') === 'true';
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, date, salary

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const query: any = { status: 'published' };
    const searchRegex = new RegExp(q, 'i');

    // Build search conditions
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { 'skills.name': searchRegex },
      { location: searchRegex },
      { department: searchRegex },
      { 'company.name': searchRegex },
    ];

    // Apply filters
    if (type.length > 0) {
      query.type = { $in: type };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minSalary > 0 || maxSalary < 10000000) {
      query['salary.min'] = { $gte: minSalary };
      query['salary.max'] = { $lte: maxSalary };
    }

    if (experience) {
      query['experience.level'] = experience;
    }

    if (skills.length > 0) {
      query['skills.name'] = { $in: skills };
    }

    if (remote) {
      query.type = 'remote';
    }

    // Determine sort order
    let sortOptions: any = {};
    switch (sortBy) {
      case 'date':
        sortOptions = { postedAt: -1 };
        break;
      case 'salary':
        sortOptions = { 'salary.max': -1 };
        break;
      case 'relevance':
      default:
        // For relevance, we'll calculate a score in aggregation
        sortOptions = { score: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    // Use aggregation for relevance scoring
    const jobs = await Job.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $addFields: {
          titleMatch: { $regexMatch: { input: '$title', regex: searchRegex } },
          descriptionMatch: { $regexMatch: { input: '$description', regex: searchRegex } },
          skillMatches: {
            $size: {
              $filter: {
                input: '$skills',
                as: 'skill',
                cond: { $regexMatch: { input: '$$skill.name', regex: searchRegex } },
              },
            },
          },
          locationMatch: { $regexMatch: { input: '$location', regex: searchRegex } },
          companyMatch: { $regexMatch: { input: '$company.name', regex: searchRegex } },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $cond: ['$titleMatch', 10, 0] }, 1] },
              { $multiply: [{ $cond: ['$companyMatch', 8, 0] }, 1] },
              { $multiply: [{ $cond: ['$locationMatch', 5, 0] }, 1] },
              { $multiply: [{ $cond: ['$descriptionMatch', 3, 0] }, 1] },
              { $multiply: ['$skillMatches', 2] },
            ],
          },
        },
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          description: 1,
          location: 1,
          type: 1,
          salary: 1,
          experience: 1,
          skills: 1,
          benefits: 1,
          postedAt: 1,
          applicationsCount: 1,
          'company._id': 1,
          'company.name': 1,
          'company.avatar': 1,
          'company.isVerified': 1,
          score: 1,
        },
      },
    ]);

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Get facet counts for filters
    const facets = await Job.aggregate([
      { $match: query },
      {
        $facet: {
          types: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          experienceLevels: [
            { $group: { _id: '$experience.level', count: { $sum: 1 } } },
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
          salaryRanges: [
            {
              $bucket: {
                groupBy: '$salary.max',
                boundaries: [0, 300000, 600000, 1000000, 1500000, 2000000, 3000000],
                default: '3000000+',
                output: { count: { $sum: 1 } },
              },
            },
          ],
        },
      },
    ]);

    // Get match scores for authenticated user
    const session = await getServerSession(authOptions);
    if (session) {
      const User = (await import('@/lib/db/models/user')).default;
      const user = await User.findById(session.user.id).select('skills');
      const userSkills = user?.skills?.map((s: any) => s.name) || [];

      jobs.forEach((job: any) => {
        const jobSkills = job.skills?.map((s: any) => s.name) || [];
        const matchingSkills = jobSkills.filter((s: string) => userSkills.includes(s));
        job.matchScore = jobSkills.length > 0
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 0;
      });
    }

    return NextResponse.json({
      jobs,
      facets: facets[0],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}