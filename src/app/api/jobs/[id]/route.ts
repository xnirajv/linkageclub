import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Increment view count
    await Job.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    const job = await Job.findById(params.id)
      .populate('companyId', 'name avatar companyName description location isVerified');

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      status: 'published',
      $or: [
        { type: job.type },
        { 'experience.level': job.experience.level },
        { skills: { $in: job.skills.slice(0, 3).map((s: any) => s.name) } },
      ],
    })
      .populate('companyId', 'name avatar companyName')
      .limit(3);

    return NextResponse.json({
      job,
      similarJobs,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    await connectDB();

    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user owns the job
    if (job.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    Object.assign(job, body);
    await job.save();

    return NextResponse.json({
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const job = await Job.findById(params.id);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user owns the job
    if (job.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Soft delete
    job.status = 'closed';
    await job.save();

    return NextResponse.json({
      message: 'Job closed successfully',
    });
  } catch (error) {
    console.error('Error closing job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}