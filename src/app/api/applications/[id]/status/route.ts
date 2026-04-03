import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import Project from '@/lib/db/models/project';
import Job from '@/lib/db/models/job';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { sendApplicationStatusEmail } from '@/lib/email/application';
import mongoose from 'mongoose';

// Define interfaces for populated documents
interface PopulatedProject {
  _id: mongoose.Types.ObjectId;
  title: string;
}

interface PopulatedJob {
  _id: mongoose.Types.ObjectId;
  title: string;
}

interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

// Define status history interface
interface StatusHistoryItem {
  status: string;
  timestamp: Date;
  notes?: string;
  updatedBy?: mongoose.Types.ObjectId | string;
}

// Extend the Application type with an interface (not a type alias)
interface PopulatedApplication extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  applicantId: PopulatedUser;
  companyId: PopulatedUser;
  projectId?: PopulatedProject | null;
  jobId?: PopulatedJob | null;
  type: 'project' | 'job';
  status: string;
  reviewNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId | string;
  reviewedAt?: Date;
  createdAt: Date;
  statusHistory?: StatusHistoryItem[];
  // save() is inherited from mongoose.Document
}

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn']),
  notes: z.string().optional(),
  sendEmail: z.boolean().default(true),
});

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
    const validation = statusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email role isActive createdAt updatedAt')
      .populate('companyId', 'name email role isActive createdAt updatedAt')
      .populate('projectId')
      .populate('jobId') as unknown as PopulatedApplication;

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const isApplicant = application.applicantId._id.toString() === session.user.id;
    const isCompany = application.companyId._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    // Only company, admin, or applicant (for withdrawal) can update status
    if (validation.data.status === 'withdrawn') {
      if (!isApplicant && !isAdmin) {
        return NextResponse.json(
          { error: 'Only the applicant can withdraw their application' },
          { status: 401 }
        );
      }
    } else {
      if (!isCompany && !isAdmin) {
        return NextResponse.json(
          { error: 'Only the company can update application status' },
          { status: 401 }
        );
      }
    }

    // Prevent status changes that don't make sense
    if (application.status === 'accepted' && validation.data.status !== 'withdrawn') {
      return NextResponse.json(
        { error: 'Cannot change status of accepted application' },
        { status: 400 }
      );
    }

    if (application.status === 'rejected' && validation.data.status !== 'withdrawn') {
      return NextResponse.json(
        { error: 'Cannot change status of rejected application' },
        { status: 400 }
      );
    }

    // Update status
    const oldStatus = application.status;
    application.status = validation.data.status;

    if (validation.data.notes) {
      application.reviewNotes = validation.data.notes;
    }

    application.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
    application.reviewedAt = new Date();

    await application.save();

    // Get the title safely
    const positionTitle = application.type === 'project'
      ? (application.projectId as any)?.title
      : (application.jobId as any)?.title;

    // Handle project status changes if accepted
    if (validation.data.status === 'accepted' && application.type === 'project') {
      await Project.findByIdAndUpdate((application.projectId as any)?._id, {
        status: 'in_progress',
        selectedApplicant: application.applicantId._id,
        startDate: new Date(),
      });
    }

    // Handle job status changes if accepted
    if (validation.data.status === 'accepted' && application.type === 'job') {
      const job = await Job.findById((application.jobId as any)?._id);
      if (job) {
        const hiredCount = job.applications?.filter((a: any) => a.status === 'hired').length || 0;
        if (hiredCount >= (job.openings || 1)) {
          job.status = 'filled';
          await job.save();
        }
      }
    }

    // Determine recipient
    const recipientId = isCompany ? application.applicantId._id : application.companyId._id;

    // Create notification
    const notification = await Notification.create({
      userId: recipientId,
      type: 'application_status',
      title: `Application ${validation.data.status}`,
      message: `Your application for ${positionTitle || 'position'} has been ${validation.data.status}`,
      data: {
        applicationId: application._id,
        oldStatus,
        newStatus: validation.data.status,
        notes: validation.data.notes,
      },
      category: 'application',
      priority: validation.data.status === 'accepted' || validation.data.status === 'rejected' ? 'high' : 'medium',
    });

    // Send email notification if requested
    if (validation.data.sendEmail) {
      try {
        // Determine which user to send email to
        const recipientUser = isCompany ? application.applicantId : application.companyId;

        await sendApplicationStatusEmail(
          recipientUser as any, // The user object from populate matches IUser structure
          positionTitle || 'position',
          validation.data.status,
          validation.data.notes
        );
      } catch (emailError) {
        console.error('Failed to send status email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Track status change for analytics
    console.log(`Application ${application._id} status changed from ${oldStatus} to ${validation.data.status} by ${session.user.id}`);

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: {
        id: application._id,
        status: application.status,
        reviewedAt: application.reviewedAt,
        reviewedBy: application.reviewedBy,
        notes: application.reviewNotes,
      },
      notification: notification._id,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get status history
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
      .select('status statusHistory reviewedAt reviewedBy reviewNotes applicantId companyId createdAt') as unknown as PopulatedApplication;

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const isApplicant = application.applicantId?._id.toString() === session.user.id;
    const isCompany = application.companyId?._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build status history
    const statusHistory = application.statusHistory || [
      {
        status: application.status,
        timestamp: application.reviewedAt || application.createdAt,
        notes: application.reviewNotes,
        updatedBy: application.reviewedBy,
      },
    ];

    return NextResponse.json({
      currentStatus: application.status,
      history: statusHistory,
      lastReviewed: application.reviewedAt,
      notes: application.reviewNotes,
    });
  } catch (error) {
    console.error('Error fetching status history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Batch status update for multiple applications
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'company') {
      return NextResponse.json(
        { error: 'Only companies can perform batch updates' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { applicationIds, status, notes } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'Application IDs are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify all applications belong to this company
    const applications = await Application.find({
      _id: { $in: applicationIds },
      companyId: session.user.id,
    });

    if (applications.length !== applicationIds.length) {
      return NextResponse.json(
        { error: 'Some applications do not belong to your company' },
        { status: 403 }
      );
    }

    // Update all applications
    const updateResult = await Application.updateMany(
      { _id: { $in: applicationIds } },
      {
        $set: {
          status,
          reviewedBy: new mongoose.Types.ObjectId(session.user.id),
          reviewedAt: new Date(),
          reviewNotes: notes,
        },
      }
    );

    // Create notifications for all applicants
    const notifications = applications.map(app => ({
      userId: app.applicantId,
      type: 'application_status',
      title: `Application ${status}`,
      message: `Your application has been ${status}`,
      data: {
        applicationId: app._id,
        newStatus: status,
        notes,
      },
      category: 'application',
    }));

    await Notification.insertMany(notifications);

    return NextResponse.json({
      message: `Successfully updated ${updateResult.modifiedCount} applications`,
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error('Error batch updating applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}