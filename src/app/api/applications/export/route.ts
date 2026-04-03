import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';
import { Parser } from 'json2csv';
import mongoose from 'mongoose';

// Define interfaces for populated documents
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  trustScore?: number;
  skills?: Array<{ name: string } | string>;
}

interface PopulatedProject {
  _id: mongoose.Types.ObjectId;
  title: string;
}

interface PopulatedJob {
  _id: mongoose.Types.ObjectId;
  title: string;
}

// Define the populated application type
interface PopulatedApplication {
  _id: mongoose.Types.ObjectId;
  type: 'project' | 'job';
  applicantId: PopulatedUser;
  projectId?: PopulatedProject | null;
  jobId?: PopulatedJob | null;
  status: string;
  submittedAt: Date;
  proposedAmount?: number;
  proposedDuration?: number;
  coverLetter?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'company') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const format = searchParams.get('format') || 'csv';

    const query: any = { companyId: session.user.id };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('applicantId', 'name email phone skills trustScore')
      .populate('projectId', 'title')
      .populate('jobId', 'title')
      .sort({ submittedAt: -1 }) as unknown as PopulatedApplication[];

    // Format data for export
    const exportData = applications.map(app => {
      // Safely get skills as strings
      let skillsList = '';
      if (app.applicantId?.skills) {
        skillsList = app.applicantId.skills
          .map((skill: any) => {
            if (typeof skill === 'string') return skill;
            if (skill && typeof skill === 'object' && 'name' in skill) return skill.name;
            return '';
          })
          .filter(Boolean)
          .join(', ');
      }

      return {
        'Application ID': app._id.toString(),
        'Type': app.type,
        'Title': app.type === 'project' 
          ? app.projectId?.title || 'N/A' 
          : app.jobId?.title || 'N/A',
        'Applicant Name': app.applicantId?.name || 'N/A',
        'Applicant Email': app.applicantId?.email || 'N/A',
        'Applicant Phone': app.applicantId?.phone || 'N/A',
        'Trust Score': app.applicantId?.trustScore || 'N/A',
        'Skills': skillsList || 'N/A',
        'Status': app.status,
        'Submitted At': app.submittedAt?.toISOString() || 'N/A',
        'Proposed Amount': app.proposedAmount || 'N/A',
        'Proposed Duration': app.proposedDuration || 'N/A',
        'Cover Letter': app.coverLetter 
          ? app.coverLetter.substring(0, 200) + (app.coverLetter.length > 200 ? '...' : '')
          : 'N/A',
        'Reviewed At': app.reviewedAt?.toISOString() || 'N/A',
        'Review Notes': app.reviewNotes || 'N/A',
      };
    });

    if (format === 'csv') {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(exportData);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=applications-${Date.now()}.csv`,
        },
      });
    } else {
      return NextResponse.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}