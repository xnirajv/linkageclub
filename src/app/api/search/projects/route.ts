import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const skills = searchParams.getAll('skills');
    const minBudget = parseInt(searchParams.get('minBudget') || '0');
    const maxBudget = parseInt(searchParams.get('maxBudget') || '1000000');
    const experienceLevel = searchParams.get('experienceLevel');
    const duration = searchParams.get('duration'); // short, medium, long
    const remote = searchParams.get('remote') === 'true';
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, budget, date, duration

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const searchRegex = new RegExp(q, 'i');

    const query: any = {
      status: 'open',
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { 'skills.name': searchRegex },
        { tags: searchRegex },
      ],
    };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (skills.length > 0) {
      query['skills.name'] = { $in: skills };
    }

    if (minBudget > 0 || maxBudget < 1000000) {
      query['budget.min'] = { $gte: minBudget };
      query['budget.max'] = { $lte: maxBudget };
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (duration) {
      switch (duration) {
        case 'short':
          query.duration = { $lte: 14 };
          break;
        case 'medium':
          query.duration = { $gt: 14, $lte: 30 };
          break;
        case 'long':
          query.duration = { $gt: 30 };
          break;
      }
    }

    if (remote) {
      query['location.type'] = 'remote';
    }

    const skip = (page - 1) * limit;

    // Determine sort order
    let sortOptions: any = {};
    switch (sortBy) {
      case 'budget':
        sortOptions = { 'budget.max': -1 };
        break;
      case 'date':
        sortOptions = { createdAt: -1 };
        break;
      case 'duration':
        sortOptions = { duration: 1 };
        break;
      case 'relevance':
      default:
        sortOptions = { score: -1 };
        break;
    }

    // Use aggregation for relevance scoring
    const projects = await Project.aggregate([
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
          companyMatch: { $regexMatch: { input: '$company.name', regex: searchRegex } },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $cond: ['$titleMatch', 10, 0] }, 1] },
              { $multiply: [{ $cond: ['$companyMatch', 5, 0] }, 1] },
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
          category: 1,
          skills: 1,
          budget: 1,
          duration: 1,
          experienceLevel: 1,
          status: 1,
          applicationsCount: 1,
          createdAt: 1,
          'company._id': 1,
          'company.name': 1,
          'company.avatar': 1,
          score: 1,
        },
      },
    ]);

    const total = await Project.countDocuments(query);

    // Get facet counts for filters
    const facets = await Project.aggregate([
      { $match: query },
      {
        $facet: {
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          experienceLevels: [
            { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
          ],
          skills: [
            { $unwind: '$skills' },
            { $group: { _id: '$skills.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          budgetRanges: [
            {
              $bucket: {
                groupBy: '$budget.max',
                boundaries: [0, 25000, 50000, 100000, 250000, 500000, 1000000],
                default: '1000000+',
                output: { count: { $sum: 1 } },
              },
            },
          ],
          durationRanges: [
            {
              $bucket: {
                groupBy: '$duration',
                boundaries: [0, 7, 14, 30, 60, 90],
                default: '90+',
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
      const user = await User.findById(session.user.id).select('skills');
      const userSkills = user?.skills?.map((s: any) => s.name) || [];

      projects.forEach((project: any) => {
        const projectSkills = project.skills?.map((s: any) => s.name) || [];
        const matchingSkills = projectSkills.filter((s: string) => userSkills.includes(s));
        project.matchScore = projectSkills.length > 0
          ? Math.round((matchingSkills.length / projectSkills.length) * 100)
          : 0;
      });
    }

    return NextResponse.json({
      projects,
      facets: facets[0],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Project search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}