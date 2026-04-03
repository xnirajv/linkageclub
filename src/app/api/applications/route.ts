import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // project, job, all
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // applicant, company

    let query: any = {};

    if (role === 'applicant') {
      query.applicantId = session.user.id;
    } else if (role === 'company') {
      query.companyId = session.user.id;
    } else {
      // If no role specified, show both where user is either applicant or company
      query.$or = [
        { applicantId: session.user.id },
        { companyId: session.user.id },
      ];
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const applications = await Application.find(query)
      .populate('applicantId', 'name avatar trustScore')
      .populate('companyId', 'name avatar companyName')
      .populate('projectId', 'title budget')
      .populate('jobId', 'title salary')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}