import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import Application from '@/lib/db/models/application';
import User from '@/lib/db/models/user';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { sendNewApplicationEmail } from '@/lib/email/application';
import mongoose from 'mongoose';

const applySchema = z.object({
  proposedAmount: z.number().min(0),
  proposedDuration: z.number().min(1),
  coverLetter: z.string().min(20).max(2000),
  portfolio: z.string().url().optional(),
  attachments: z.array(z.string()).optional(),
  additionalInfo: z.string().optional(),
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

    if (session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can apply to projects' },
        { status: 403 }
      );
    }

    // ✅ FIX: Parse JSON instead of FormData
    const body = await req.json();
    const { proposedAmount, proposedDuration, coverLetter, portfolio, additionalInfo, attachments } = body;

    const validation = applySchema.safeParse({
      proposedAmount,
      proposedDuration,
      coverLetter,
      portfolio,
      additionalInfo,
      attachments: attachments || [],
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const project = await Project.findById(params.id)
      .populate('companyId', 'name email') as any;

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.status !== 'open') {
      return NextResponse.json(
        { error: 'This project is no longer accepting applications' },
        { status: 400 }
      );
    }

    const existingApplication = await Application.findOne({
      projectId: project._id,
      applicantId: session.user.id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this project' },
        { status: 400 }
      );
    }

    if (proposedAmount < project.budget.min || proposedAmount > project.budget.max) {
      return NextResponse.json(
        { error: `Proposed amount must be between ${project.budget.min} and ${project.budget.max}` },
        { status: 400 }
      );
    }

    if (proposedDuration > project.duration) {
      return NextResponse.json(
        { error: `Proposed duration cannot exceed ${project.duration} days` },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id).select('skills') as any;

    const userSkills = user?.skills?.map((s: any) => {
      if (typeof s === 'string') return s;
      if (s?.name) return s.name;
      return '';
    }).filter(Boolean) || [];
    
    const requiredSkills = project.skills
      .filter((s: any) => s.mandatory)
      .map((s: any) => s.name);

    const matchedSkills = requiredSkills.filter((skill: string) => 
      userSkills.includes(skill)
    );
    const missingSkills = requiredSkills.filter((skill: string) => 
      !userSkills.includes(skill)
    );

    const matchScore = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0;

    const attachmentUrls = Array.isArray(attachments)
      ? attachments.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];

    const application = await Application.create({
      type: 'project',
      projectId: project._id,
      applicantId: new mongoose.Types.ObjectId(session.user.id),
      companyId: project.companyId._id,
      proposedAmount,
      proposedDuration,
      coverLetter,
      portfolio,
      attachments: attachmentUrls,
      additionalInfo,
      status: 'pending',
      matchScore,
      matchedSkills,
      missingSkills,
      submittedAt: new Date(),
    });

    project.applications.push({
      userId: new mongoose.Types.ObjectId(session.user.id),
      applicationId: application._id,
      proposedAmount,
      proposedDuration,
      coverLetter,
      attachments: attachmentUrls,
      status: 'pending',
      submittedAt: new Date(),
    });
    project.applicationsCount = project.applications.length;
    await project.save();

    await Notification.create({
      userId: project.companyId._id,
      type: 'new_application',
      title: 'New Project Application',
      message: `${session.user.name} has applied to ${project.title}`,
      data: {
        projectId: project._id,
        applicationId: application._id,
        applicantId: session.user.id,
        applicantName: session.user.name,
        proposedAmount,
        proposedDuration,
        matchScore,
      },
      link: `/dashboard/company/my-projects/${project._id}/applications`,
      category: 'application',
      priority: 'high',
    });

    try {
      await sendNewApplicationEmail(
        project.companyId.email,
        session.user.name,
        project.title,
        application._id.toString()
      );
    } catch (emailError) {
      console.error('Failed to send email to company:', emailError);
    }

    await Notification.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for ${project.title} has been submitted successfully`,
      data: {
        projectId: project._id,
        applicationId: application._id,
        proposedAmount,
        proposedDuration,
      },
      link: `/dashboard/student/projects/my-applications`,
      category: 'application',
    });

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        status: application.status,
        matchScore: application.matchScore,
        proposedAmount: application.proposedAmount,
        proposedDuration: application.proposedDuration,
      },
    });
  } catch (error) {
    console.error('Error applying to project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const application = await Application.findOne({
      projectId: params.id,
      applicantId: session.user.id,
    }).select('status submittedAt proposedAmount proposedDuration matchScore') as any;

    return NextResponse.json({
      hasApplied: !!application,
      application: application ? {
        id: application._id,
        status: application.status,
        submittedAt: application.submittedAt,
        proposedAmount: application.proposedAmount,
        proposedDuration: application.proposedDuration,
        matchScore: application.matchScore,
      } : null,
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
