import { NextResponse } from 'next/server';
import Project from '@/lib/db/models/project';
import connectDB from '@/lib/db/connect';

export async function GET() {
  try {
    await connectDB();

    const stats = await Project.aggregate([
      {
        $facet: {
          totalProjects: [{ $count: 'count' }],
          openProjects: [
            { $match: { status: 'open' } },
            { $count: 'count' },
          ],
          inProgressProjects: [
            { $match: { status: 'in_progress' } },
            { $count: 'count' },
          ],
          completedProjects: [
            { $match: { status: 'completed' } },
            { $count: 'count' },
          ],
          averageBudget: [
            { $group: {
              _id: null,
              avg: { $avg: '$budget.max' },
            }},
          ],
          byCategory: [
            { $group: {
              _id: '$category',
              count: { $sum: 1 },
            }},
          ],
          byExperience: [
            { $group: {
              _id: '$experienceLevel',
              count: { $sum: 1 },
            }},
          ],
        },
      },
    ]);

    const result = {
      totalProjects: stats[0].totalProjects[0]?.count || 0,
      openProjects: stats[0].openProjects[0]?.count || 0,
      inProgressProjects: stats[0].inProgressProjects[0]?.count || 0,
      completedProjects: stats[0].completedProjects[0]?.count || 0,
      averageBudget: stats[0].averageBudget[0]?.avg || 0,
      byCategory: stats[0].byCategory,
      byExperience: stats[0].byExperience,
    };

    return NextResponse.json({ stats: result });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}