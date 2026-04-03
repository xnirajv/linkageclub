import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import SavedJob from '@/lib/db/models/savedJob';
import Job from '@/lib/db/models/job';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find all saved jobs for this user
    const savedJobs = await SavedJob.find({
      userId: new mongoose.Types.ObjectId(session.user.id),
    }).sort({ savedAt: -1 });

    if (!savedJobs || savedJobs.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    // Get the job IDs
    const jobIds = savedJobs.map(saved => saved.jobId);

    // Fetch the actual jobs
    const jobs = await Job.find({
      _id: { $in: jobIds },
      status: 'published',
    }).populate('companyId', 'name avatar companyName');

    // Add savedAt date to each job
    const jobsWithSavedDate = jobs.map(job => {
      const savedJob = savedJobs.find(
        saved => saved.jobId.toString() === job._id.toString()
      );
      return {
        ...job.toObject(),
        savedAt: savedJob?.savedAt,
      };
    });

    return NextResponse.json({ jobs: jobsWithSavedDate });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}