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
import mongoose from 'mongoose';

const submissionSchema = z.object({
  milestoneId: z.string(),
  work: z.string().min(10),
  attachments: z.array(z.string()).optional(),
  hoursSpent: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = submissionSchema.safeParse(body);
    if (!validation.success)
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });

    await connectDB();

    const project = await Project.findById(params.id)
      .populate('companyId', 'name email')
      .populate('selectedApplicant', 'name email');

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (project.selectedApplicant?.toString() !== session.user.id)
      return NextResponse.json({ error: 'Only assigned freelancer can submit' }, { status: 401 });

    const milestone = await Milestone.findById(validation.data.milestoneId);
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    if (milestone.projectId.toString() !== params.id)
      return NextResponse.json({ error: 'Invalid milestone' }, { status: 400 });
    if (milestone.status === 'completed' || milestone.status === 'approved')
      return NextResponse.json({ error: 'Milestone already completed' }, { status: 400 });

    const submission = await Submission.create({
      projectId: project._id,
      milestoneId: milestone._id,
      work: validation.data.work,
      attachments: validation.data.attachments || [],
      hoursSpent: validation.data.hoursSpent,
      notes: validation.data.notes,
      status: 'pending',
      submittedBy: session.user.id,
      submittedAt: new Date(),
    });

    milestone.status = 'completed';
    milestone.completedAt = new Date();
    milestone.completedBy = new mongoose.Types.ObjectId(session.user.id);
    milestone.submissions.push(submission._id);
    await milestone.save();

    await Notification.create({
      userId: project.companyId,
      type: 'milestone_submitted',
      title: 'Milestone Submission',
      message: `${session.user.name} has submitted work for milestone: ${milestone.title}`,
      data: { projectId: project._id, milestoneId: milestone._id, submissionId: submission._id },
      link: `/dashboard/company/my-projects/${project._id}/manage`,
      category: 'project',
      priority: 'high',
    });

    return NextResponse.json({
      message: 'Work submitted successfully',
      submission: { id: submission._id, work: submission.work, submittedAt: submission.submittedAt },
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const milestoneId = searchParams.get('milestoneId');

    await connectDB();

    const project = await Project.findById(params.id).select('title companyId selectedApplicant');
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const isCompany = project.companyId.toString() === session.user.id;
    const isFreelancer = project.selectedApplicant?.toString() === session.user.id;
    if (!isCompany && !isFreelancer && session.user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const query: any = { projectId: params.id };
    if (milestoneId) query.milestoneId = milestoneId;

    const submissions = await Submission.find(query)
      .populate('submittedBy', 'name avatar')
      .populate('reviewedBy', 'name avatar')
      .populate('milestoneId', 'title amount')
      .sort({ submittedAt: -1 });

    return NextResponse.json({ projectId: project._id, projectTitle: project.title, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { submissionId, action, feedback } = body;
    if (!submissionId || !action || !['approve', 'reject'].includes(action))
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    await connectDB();

    const project = await Project.findById(params.id)
      .populate('companyId', 'name email')
      .populate('selectedApplicant', 'name email');

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (project.companyId.toString() !== session.user.id)
      return NextResponse.json({ error: 'Only company can review' }, { status: 401 });

    const submission = await Submission.findById(submissionId).populate('milestoneId');
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    if (submission.projectId.toString() !== params.id)
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });

    const milestone = await Milestone.findById(submission.milestoneId);
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });

    if (action === 'approve') {
      submission.status = 'approved';
      submission.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
      submission.reviewedAt = new Date();
      if (feedback) submission.feedback = feedback;
      await submission.save();

      milestone.status = 'approved';
      milestone.approvedAt = new Date();
      milestone.approvedBy = new mongoose.Types.ObjectId(session.user.id);
      if (feedback) milestone.feedback = feedback;
      await milestone.save();

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

        await Notification.create({
          userId: project.selectedApplicant,
          type: 'milestone_approved',
          title: 'Milestone Approved',
          message: `Your work for "${milestone.title}" has been approved. Payment processing.`,
          data: { projectId: project._id, milestoneId: milestone._id, amount: milestone.amount, paymentId: payment._id },
          category: 'project',
          priority: 'high',
        });
      }
    } else {
      submission.status = 'rejected';
      submission.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
      submission.reviewedAt = new Date();
      if (feedback) submission.feedback = feedback;
      await submission.save();

      milestone.status = 'in_progress';
      if (feedback) milestone.feedback = feedback;
      await milestone.save();

      if (project.selectedApplicant) {
        await Notification.create({
          userId: project.selectedApplicant,
          type: 'milestone_rejected',
          title: 'Changes Requested',
          message: `Company requested changes for "${milestone.title}".`,
          data: { projectId: project._id, milestoneId: milestone._id, feedback },
          category: 'project',
          priority: 'medium',
        });
      }
    }

    return NextResponse.json({
      message: action === 'approve' ? 'Submission approved' : 'Submission rejected',
      submission: { id: submission._id, status: submission.status },
      milestone: { id: milestone._id, title: milestone.title, status: milestone.status },
    });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}