import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';

export async function POST(
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

    const application = await Application.findById(params.id);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is the applicant
    if (application.applicantId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the applicant can withdraw their application' },
        { status: 401 }
      );
    }

    // Can only withdraw pending applications
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot withdraw application with status: ${application.status}` },
        { status: 400 }
      );
    }

    application.status = 'withdrawn';
    await application.save();

    // Remove from project/job applications array
    if (application.type === 'project' && application.projectId) {
      const Project = (await import('@/lib/db/models/project')).default;
      await Project.findByIdAndUpdate(application.projectId, {
        $pull: { applications: { userId: session.user.id } },
      });
    } else if (application.type === 'job' && application.jobId) {
      const Job = (await import('@/lib/db/models/job')).default;
      await Job.findByIdAndUpdate(application.jobId, {
        $pull: { applications: { userId: session.user.id } },
      });
    }

    return NextResponse.json({
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}