import { NextResponse } from 'next/server';
import Assessment from '@/lib/db/models/assessment';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const stats = await Assessment.aggregate([
      {
        $facet: {
          totalAssessments: [{ $count: 'count' }],
          byLevel: [
            { $group: {
              _id: '$level',
              count: { $sum: 1 },
            }},
          ],
          bySkill: [
            { $group: {
              _id: '$skillName',
              count: { $sum: 1 },
              averageScore: { $avg: '$averageScore' },
              passRate: { $avg: '$passRate' },
            }},
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          overall: [
            { $group: {
              _id: null,
              totalAttempts: { $sum: '$totalAttempts' },
              avgPassRate: { $avg: '$passRate' },
              avgScore: { $avg: '$averageScore' },
            }},
          ],
        },
      },
    ]);

    const result = {
      totalAssessments: stats[0].totalAssessments[0]?.count || 0,
      byLevel: stats[0].byLevel,
      bySkill: stats[0].bySkill,
      overall: stats[0].overall[0] || {
        totalAttempts: 0,
        avgPassRate: 0,
        avgScore: 0,
      },
    };

    return NextResponse.json({ stats: result });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}