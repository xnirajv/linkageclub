import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import Milestone from '@/lib/db/models/milestone';
import Submission from '@/lib/db/models/submission';
import Notification from '@/lib/db/models/notification';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { uploadFile } from '@/lib/utils/upload';
import mongoose from 'mongoose';

const submissionSchema = z.object({
  milestoneId: z.string(),
  work: z.string().min(10, 'Work description must be at least 10 characters'),
  attachments: z.array(z.string()).optional(),
  hoursSpent: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function POST(
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

    const formData = await req.formData();
    const milestoneId = formData.get('milestoneId') as string;
    const work = formData.get('work') as string;
    const hoursSpent = formData.get('hoursSpent') ? Number(formData.get('hoursSpent')) : undefined;
    const notes = formData.get('notes') as string;
    const files = formData.getAll('attachments') as File[];

    // Validate input
    const validation = submissionSchema.safeParse({
      milestoneId,
      work,
      hoursSpent,
      notes,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id)
      .populate('companyId', 'name email')
      .populate('selectedApplicant', 'name email');

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is the selected freelancer
    if (project.selectedApplicant?.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the assigned freelancer can submit work' },
        { status: 401 }
      );
    }

    // Get the milestone
    const milestone = await Milestone.findById(milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Check if milestone belongs to this project
    if (milestone.projectId.toString() !== params.id) {
      return NextResponse.json(
        { error: 'Milestone does not belong to this project' },
        { status: 400 }
      );
    }

    // Check if milestone can be submitted
    if (milestone.status === 'completed' || milestone.status === 'approved') {
      return NextResponse.json(
        { error: 'This milestone has already been completed' },
        { status: 400 }
      );
    }

    // Upload attachments
    const attachments: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadFile(file, `projects/${project._id}/submissions`);
        attachments.push(url);
      }
    }

    // Create submission record
    const submission = await Submission.create({
      projectId: project._id,
      milestoneId: milestone._id,
      work,
      attachments,
      hoursSpent,
      notes,
      status: 'pending',
      submittedBy: session.user.id,
      submittedAt: new Date(),
    });

    // Update milestone
    milestone.status = 'completed';
    milestone.completedAt = new Date();
    milestone.completedBy = new mongoose.Types.ObjectId(session.user.id);
    milestone.submissions.push(submission._id);
    await milestone.save();

    // Create notification for company
    await Notification.create({
      userId: project.companyId,
      type: 'milestone_submitted',
      title: 'Milestone Submission',
      message: `${session.user.name} has submitted work for milestone: ${milestone.title}`,
      data: {
        projectId: project._id,
        milestoneId: milestone._id,
        milestoneTitle: milestone.title,
        submissionId: submission._id,
      },
      link: `/dashboard/company/projects/${project._id}`,
      category: 'project',
      priority: 'high',
    });

    return NextResponse.json({
      message: 'Work submitted successfully',
      submission: {
        id: submission._id,
        work: submission.work,
        attachments: submission.attachments,
        hoursSpent: submission.hoursSpent,
        submittedAt: submission.submittedAt,
      },
      milestone: {
        id: milestone._id,
        title: milestone.title,
        status: milestone.status,
        completedAt: milestone.completedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get submission history
export async function GET(
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

    const { searchParams } = new URL(req.url);
    const milestoneId = searchParams.get('milestoneId');

    await connectDB();

    const project = await Project.findById(params.id)
      .select('title companyId selectedApplicant');

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check authorization
    const isCompany = project.companyId.toString() === session.user.id;
    const isFreelancer = project.selectedApplicant?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isCompany && !isFreelancer && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query: any = { projectId: params.id };
    if (milestoneId) {
      query.milestoneId = milestoneId;
    }

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'name avatar')
      .populate('reviewedBy', 'name avatar')
      .populate('milestoneId', 'title amount')
      .sort({ submittedAt: -1 });

    return NextResponse.json({
      projectId: project._id,
      projectTitle: project.title,
      submissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Approve/reject submission
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
    const { submissionId, action, feedback } = body;

    if (!submissionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id)
      .populate('companyId', 'name email')
      .populate('selectedApplicant', 'name email');

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is the company
    if (project.companyId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the company can review submissions' },
        { status: 401 }
      );
    }

    // Get the submission
    const submission = await Submission.findById(submissionId)
      .populate('milestoneId');

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if submission belongs to this project
    if (submission.projectId.toString() !== params.id) {
      return NextResponse.json(
        { error: 'Submission does not belong to this project' },
        { status: 400 }
      );
    }

    const milestone = await Milestone.findById(submission.milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Update submission
      submission.status = 'approved';
      submission.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
      submission.reviewedAt = new Date();
      if (feedback) submission.feedback = feedback;
      await submission.save();

      // Update milestone
      milestone.status = 'approved';
      milestone.approvedAt = new Date();
      milestone.approvedBy = new mongoose.Types.ObjectId(session.user.id);
      if (feedback) milestone.feedback = feedback;
      await milestone.save();

      // Create payment record if selectedApplicant exists
      if (project.selectedApplicant) {
        const payment = await Payment.create({
          transactionId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: project._id,
          milestoneId: milestone._id,
          amount: milestone.amount,
          status: 'pending',
          type: 'project',
          userId: project.selectedApplicant,
          companyId: project.companyId,
        });

        // Create notification for freelancer
        await Notification.create({
          userId: project.selectedApplicant,
          type: 'milestone_approved',
          title: 'Milestone Approved',
          message: `Your work for milestone "${milestone.title}" has been approved. Payment will be processed soon.`,
          data: {
            projectId: project._id,
            milestoneId: milestone._id,
            amount: milestone.amount,
            paymentId: payment._id,
          },
          category: 'project',
          priority: 'high',
        });
      }
    } else {
      // Reject submission
      submission.status = 'rejected';
      submission.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
      submission.reviewedAt = new Date();
      if (feedback) submission.feedback = feedback;
      await submission.save();

      // Update milestone back to in_progress
      milestone.status = 'in_progress';
      if (feedback) milestone.feedback = feedback;
      await milestone.save();

      // Create notification for freelancer if selectedApplicant exists
      if (project.selectedApplicant) {
        await Notification.create({
          userId: project.selectedApplicant,
          type: 'milestone_rejected',
          title: 'Changes Requested',
          message: `The company has requested changes for milestone "${milestone.title}".`,
          data: {
            projectId: project._id,
            milestoneId: milestone._id,
            feedback,
          },
          category: 'project',
          priority: 'medium',
        });
      }
    }

    return NextResponse.json({
      message: action === 'approve' ? 'Submission approved' : 'Submission rejected',
      submission: {
        id: submission._id,
        status: submission.status,
      },
      milestone: {
        id: milestone._id,
        title: milestone.title,
        status: milestone.status,
      },
    });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}