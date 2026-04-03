import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';

export async function GET(
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

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name avatar email phone trustScore skills')
      .populate('companyId', 'name avatar companyName')
      .populate('projectId')
      .populate('jobId');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this application
    const isApplicant = application.applicantId._id.toString() === session.user.id;
    const isCompany = application.companyId._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}