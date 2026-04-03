import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import Notification from '@/lib/db/models/notification';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose';

const milestoneSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  deadline: z.number().min(1, 'Deadline must be at least 1 day'),
  deliverables: z.array(z.string()).optional(),
});

const milestoneUpdateSchema = z.object({
  milestoneId: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'approved']),
  feedback: z.string().optional(),
});

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

    const project = await Project.findById(params.id)
      .select('milestones title companyId selectedApplicant') as any;

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

    // Calculate milestone statistics
    const milestones = project.milestones || [];
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m: any) => m.status === 'approved').length;
    const inProgressMilestones = milestones.filter((m: any) => m.status === 'in_progress').length;
    const pendingMilestones = milestones.filter((m: any) => m.status === 'pending').length;

    const totalBudget = milestones.reduce((sum: number, m: any) => sum + (m.amount || 0), 0);
    const releasedBudget = milestones
      .filter((m: any) => m.status === 'approved')
      .reduce((sum: number, m: any) => sum + (m.amount || 0), 0);

    return NextResponse.json({
      milestones,
      stats: {
        total: totalMilestones,
        completed: completedMilestones,
        inProgress: inProgressMilestones,
        pending: pendingMilestones,
        progress: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
        totalBudget,
        releasedBudget,
        remainingBudget: totalBudget - releasedBudget,
      },
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const validation = milestoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id) as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Only company can add milestones
    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the project owner can add milestones' },
        { status: 401 }
      );
    }

    // Create new milestone with proper typing
    const milestone = {
      _id: new mongoose.Types.ObjectId(),
      title: validation.data.title,
      description: validation.data.description || '',
      amount: validation.data.amount,
      deadline: validation.data.deadline,
      deliverables: validation.data.deliverables || [],
      status: 'pending' as const,
      createdAt: new Date(),
    };

    if (!project.milestones) {
      project.milestones = [];
    }
    project.milestones.push(milestone);
    await project.save();

    // Notify freelancer if project has started
    if (project.selectedApplicant) {
      await Notification.create({
        userId: project.selectedApplicant,
        type: 'milestone_added',
        title: 'New Milestone Added',
        message: `A new milestone "${milestone.title}" has been added to the project`,
        data: {
          projectId: project._id,
          milestoneId: milestone._id,
          amount: milestone.amount,
          deadline: milestone.deadline,
        },
        link: `/dashboard/student/projects/active/${project._id}`,
        category: 'project',
      });
    }

    return NextResponse.json({
      message: 'Milestone added successfully',
      milestone,
    });
  } catch (error) {
    console.error('Error adding milestone:', error);
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
    const validation = milestoneUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id)
      .populate('companyId', 'name email')
      .populate('selectedApplicant', 'name email') as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Find the milestone
    const milestone = project.milestones?.find(
      (m: any) => m._id?.toString() === validation.data.milestoneId
    );

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Check authorization based on status change
    const isCompany = project.companyId?._id?.toString() === session.user.id;
    const isFreelancer = project.selectedApplicant?._id?.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (validation.data.status === 'completed') {
      // Only freelancer can mark as completed
      if (!isFreelancer && !isAdmin) {
        return NextResponse.json(
          { error: 'Only the assigned freelancer can mark milestones as completed' },
          { status: 401 }
        );
      }
    } else if (validation.data.status === 'approved') {
      // Only company can approve
      if (!isCompany && !isAdmin) {
        return NextResponse.json(
          { error: 'Only the company can approve milestones' },
          { status: 401 }
        );
      }
    } else if (validation.data.status === 'in_progress') {
      // Both can start a milestone
      if (!isCompany && !isFreelancer && !isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Validate status transitions
    const currentStatus = milestone.status;
    const newStatus = validation.data.status;

    const validTransitions: Record<string, string[]> = {
      pending: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: ['approved', 'in_progress'], // in_progress for revision
      approved: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${newStatus}` },
        { status: 400 }
      );
    }

    // Update milestone
    milestone.status = newStatus;
    
    if (newStatus === 'completed') {
      milestone.completedAt = new Date();
      milestone.completedBy = session.user.id;
    } else if (newStatus === 'approved') {
      milestone.approvedAt = new Date();
      milestone.approvedBy = session.user.id;

      // Check if selectedApplicant exists
      if (project.selectedApplicant?._id) {
        // Create payment record
        await Payment.create({
          transactionId: `MIL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: project._id,
          milestoneId: milestone._id,
          amount: milestone.amount,
          status: 'pending',
          type: 'project',
          userId: project.selectedApplicant._id,
          companyId: project.companyId._id,
        });
      }
    }

    if (validation.data.feedback) {
      milestone.feedback = validation.data.feedback;
    }

    await project.save();

    // Determine notification recipient
    const notifyUserId = isFreelancer 
      ? project.companyId?._id 
      : (isCompany ? project.selectedApplicant?._id : null);

    if (notifyUserId) {
      let notificationTitle = '';
      let notificationMessage = '';

      switch (newStatus) {
        case 'in_progress':
          notificationTitle = 'Milestone Started';
          notificationMessage = `Milestone "${milestone.title}" has been started`;
          break;
        case 'completed':
          notificationTitle = 'Milestone Completed';
          notificationMessage = `Milestone "${milestone.title}" has been marked as completed`;
          break;
        case 'approved':
          notificationTitle = 'Milestone Approved';
          notificationMessage = `Milestone "${milestone.title}" has been approved. Payment will be processed soon.`;
          break;
      }

      if (notificationTitle) {
        await Notification.create({
          userId: notifyUserId,
          type: 'milestone_update',
          title: notificationTitle,
          message: notificationMessage,
          data: {
            projectId: project._id,
            milestoneId: milestone._id,
            milestoneTitle: milestone.title,
            newStatus,
            feedback: validation.data.feedback,
          },
          link: `/${isFreelancer ? 'company' : 'student'}/projects/${project._id}`,
          category: 'project',
          priority: 'high',
        });
      }
    }

    return NextResponse.json({
      message: 'Milestone updated successfully',
      milestone: {
        id: milestone._id,
        title: milestone.title,
        status: milestone.status,
        completedAt: milestone.completedAt,
        approvedAt: milestone.approvedAt,
        feedback: milestone.feedback,
      },
    });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    if (!milestoneId) {
      return NextResponse.json(
        { error: 'Milestone ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id) as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Only company can delete milestones
    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the project owner can delete milestones' },
        { status: 401 }
      );
    }

    // Find and remove milestone
    const milestoneIndex = project.milestones?.findIndex(
      (m: any) => m._id?.toString() === milestoneId
    );

    if (milestoneIndex === -1 || milestoneIndex === undefined) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    const milestone = project.milestones[milestoneIndex];

    // Can only delete pending milestones
    if (milestone.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot delete milestone that is in progress or completed' },
        { status: 400 }
      );
    }

    project.milestones.splice(milestoneIndex, 1);
    await project.save();

    return NextResponse.json({
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Batch update milestones
export async function PUT(
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
    const { milestones } = body;

    if (!milestones || !Array.isArray(milestones)) {
      return NextResponse.json(
        { error: 'Milestones array is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id) as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Only company can update milestones
    if (project.companyId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only the project owner can update milestones' },
        { status: 401 }
      );
    }

    // Validate all milestones
    for (const milestone of milestones) {
      const validation = milestoneSchema.safeParse(milestone);
      if (!validation.success) {
        return NextResponse.json(
          { error: 'Invalid milestone data', details: validation.error.errors },
          { status: 400 }
        );
      }
    }

    // Replace all milestones
    project.milestones = milestones.map((m, index) => ({
      _id: m._id ? new mongoose.Types.ObjectId(m._id) : new mongoose.Types.ObjectId(),
      title: m.title,
      description: m.description || '',
      amount: m.amount,
      deadline: m.deadline,
      deliverables: m.deliverables || [],
      order: index,
      status: m.status || 'pending',
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
    }));

    await project.save();

    return NextResponse.json({
      message: 'Milestones updated successfully',
      milestones: project.milestones,
    });
  } catch (error) {
    console.error('Error updating milestones:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}