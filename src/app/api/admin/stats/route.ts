import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import User from '@/lib/db/models/user';
import Project from '@/lib/db/models/project';
import Job from '@/lib/db/models/job';
import Payment from '@/lib/db/models/payment';
import Assessment from '@/lib/db/models/assessment';
import { Post } from '@/lib/db/models/community';
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

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const stats = await Promise.all([
      // User stats
      User.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byRole: [
              { $group: { _id: '$role', count: { $sum: 1 } } },
            ],
            verified: [
              { $match: { emailVerified: true } },
              { $count: 'count' },
            ],
            newThisMonth: [
              { $match: { createdAt: { $gte: firstDayOfMonth } } },
              { $count: 'count' },
            ],
            activeToday: [
              { $match: { lastActive: { $gte: new Date(now.setHours(0,0,0,0)) } } },
              { $count: 'count' },
            ],
          },
        },
      ]),

      // Project stats
      Project.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
            ],
            newThisMonth: [
              { $match: { createdAt: { $gte: firstDayOfMonth } } },
              { $count: 'count' },
            ],
            totalBudget: [
              { $group: { _id: null, total: { $sum: '$budget.max' } } },
            ],
          },
        },
      ]),

      // Job stats
      Job.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
            ],
            newThisMonth: [
              { $match: { postedAt: { $gte: firstDayOfMonth } } },
              { $count: 'count' },
            ],
            totalApplications: [
              { $project: { applicationsCount: 1 } },
              { $group: { _id: null, total: { $sum: '$applicationsCount' } } },
            ],
          },
        },
      ]),

      // Payment stats
      Payment.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
            ],
            revenueThisMonth: [
              { $match: { 
                status: 'completed',
                createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
              }},
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ],
            platformFees: [
              { $match: { status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$fees.platformFee' } } },
            ],
          },
        },
      ]),

      // Assessment stats
      Assessment.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            totalAttempts: [
              { $group: { _id: null, total: { $sum: '$totalAttempts' } } },
            ],
            averagePassRate: [
              { $group: { _id: null, avg: { $avg: '$passRate' } } },
            ],
          },
        },
      ]),

      // Community stats
      Post.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            reported: [
              { $match: { reportCount: { $gt: 0 } } },
              { $count: 'count' },
            ],
            hidden: [
              { $match: { isHidden: true } },
              { $count: 'count' },
            ],
          },
        },
      ]),
    ]);

    const response = {
      users: {
        total: stats[0][0].total[0]?.count || 0,
        byRole: stats[0][0].byRole,
        verified: stats[0][0].verified[0]?.count || 0,
        newThisMonth: stats[0][0].newThisMonth[0]?.count || 0,
        activeToday: stats[0][0].activeToday[0]?.count || 0,
      },
      projects: {
        total: stats[1][0].total[0]?.count || 0,
        byStatus: stats[1][0].byStatus,
        newThisMonth: stats[1][0].newThisMonth[0]?.count || 0,
        totalBudget: stats[1][0].totalBudget[0]?.total || 0,
      },
      jobs: {
        total: stats[2][0].total[0]?.count || 0,
        byStatus: stats[2][0].byStatus,
        newThisMonth: stats[2][0].newThisMonth[0]?.count || 0,
        totalApplications: stats[2][0].totalApplications[0]?.total || 0,
      },
      payments: {
        total: stats[3][0].total[0]?.count || 0,
        byStatus: stats[3][0].byStatus,
        revenueThisMonth: stats[3][0].revenueThisMonth[0]?.total || 0,
        platformFees: stats[3][0].platformFees[0]?.total || 0,
      },
      assessments: {
        total: stats[4][0].total[0]?.count || 0,
        totalAttempts: stats[4][0].totalAttempts[0]?.total || 0,
        averagePassRate: stats[4][0].averagePassRate[0]?.avg || 0,
      },
      community: {
        totalPosts: stats[5][0].total[0]?.count || 0,
        reportedPosts: stats[5][0].reported[0]?.count || 0,
        hiddenPosts: stats[5][0].hidden[0]?.count || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}