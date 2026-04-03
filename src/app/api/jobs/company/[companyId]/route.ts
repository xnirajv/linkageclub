import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.id !== params.companyId && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = { companyId: params.companyId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    const total = await Job.countDocuments(query);

    // Get application counts for all jobs in a single aggregation
    const jobIds = jobs.map(job => job._id);
    
    const applicationStats = await Job.aggregate([
      { $match: { _id: { $in: jobIds } } },
      { $unwind: '$applications' },
      {
        $group: {
          _id: {
            jobId: '$_id',
            status: '$applications.status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.jobId',
          stats: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      }
    ]);

    // Create a map for easy lookup
    const statsMap = new Map();
    applicationStats.forEach((stat: any) => {
      const statsObj: Record<string, number> = {};
      stat.stats.forEach((s: any) => {
        statsObj[s.status] = s.count;
      });
      statsMap.set(stat._id.toString(), statsObj);
    });

    // Combine jobs with their stats
    const jobsWithStats = jobs.map(job => {
      const jobObj: any = { ...job };
      jobObj.applicationStats = statsMap.get(job._id.toString()) || {};
      jobObj.totalApplications = job.applications?.length || 0;
      return jobObj;
    });

    return NextResponse.json({
      jobs: jobsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}