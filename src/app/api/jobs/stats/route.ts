import { NextResponse } from 'next/server';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const stats = await Job.aggregate([
      {
        $facet: {
          totalJobs: [{ $count: 'count' }],
          activeJobs: [
            { $match: { status: 'published' } },
            { $count: 'count' },
          ],
          byType: [
            { $match: { status: 'published' } },
            { $group: {
              _id: '$type',
              count: { $sum: 1 },
              avgSalary: { $avg: '$salary.max' },
            }},
          ],
          byExperience: [
            { $match: { status: 'published' } },
            { $group: {
              _id: '$experience.level',
              count: { $sum: 1 },
            }},
          ],
          byLocation: [
            { $match: { status: 'published' } },
            { $group: {
              _id: '$location',
              count: { $sum: 1 },
            }},
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          topSkills: [
            { $match: { status: 'published' } },
            { $unwind: '$skills' },
            { $group: {
              _id: '$skills.name',
              count: { $sum: 1 },
              avgSalary: { $avg: '$salary.max' },
            }},
            { $sort: { count: -1 } },
            { $limit: 20 },
          ],
          salaryRange: [
            { $match: { status: 'published' } },
            { $bucket: {
              groupBy: '$salary.max',
              boundaries: [0, 300000, 600000, 1000000, 1500000, 2000000, 3000000],
              default: '3000000+',
              output: {
                count: { $sum: 1 },
                jobs: { $push: '$$ROOT' },
              },
            }},
          ],
        },
      },
    ]);

    const result = {
      totalJobs: stats[0].totalJobs[0]?.count || 0,
      activeJobs: stats[0].activeJobs[0]?.count || 0,
      byType: stats[0].byType,
      byExperience: stats[0].byExperience,
      byLocation: stats[0].byLocation,
      topSkills: stats[0].topSkills,
      salaryRange: stats[0].salaryRange,
    };

    return NextResponse.json({ stats: result });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}