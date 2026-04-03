import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Application from '@/lib/db/models/application';
import Notification from '@/lib/db/models/notification';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import { sendInterviewInvitationEmail } from '@/lib/email/application';
import { IUser } from '@/lib/db/models/user';
import { Document } from 'mongoose'; // Add this import

// Define the Interview interface
interface IInterview {
  scheduled: boolean;
  date?: Date;
  type?: 'video' | 'phone' | 'in-person';
  duration?: number;
  link?: string;
  location?: string;
  notes?: string;
  interviewer?: string;
  attendees?: string[];
  status?: 'scheduled' | 'rescheduled' | 'completed' | 'cancelled';
  feedback?: string;
  rating?: number;
  recommendation?: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  nextSteps?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  completedAt?: Date;
}

// Define interfaces for populated documents
interface PopulatedProject {
  _id: any;
  title: string;
}

interface PopulatedJob {
  _id: any;
  title: string;
}

interface PopulatedUser {
  _id: any;
  name: string;
  email: string;
  role?: string;
}

// Extend the Application type to include populated fields and interview
// Using Document intersection to include all Mongoose document methods
type PopulatedApplication = Document & {
  _id: any;
  applicantId: PopulatedUser;
  companyId: PopulatedUser;
  projectId?: PopulatedProject | null;
  jobId?: PopulatedJob | null;
  type: 'project' | 'job';
  status: string;
  interview?: IInterview;
};

const interviewSchema = z.object({
  date: z.string(),
  time: z.string(),
  type: z.enum(['video', 'phone', 'in-person']),
  duration: z.number().min(15).max(180).default(60),
  link: z.string().url().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  interviewer: z.string().optional(),
  attendees: z.array(z.string()).optional(),
});

const interviewFeedbackSchema = z.object({
  feedback: z.string(),
  rating: z.number().min(1).max(5).optional(),
  recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no', 'strong_no']).optional(),
  nextSteps: z.string().optional(),
});

// Helper function to convert populated user to IUser
function toIUser(user: PopulatedUser): IUser {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as IUser;
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
    const validation = interviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email role')
      .populate('companyId', 'name email role')
      .populate('projectId', 'title')
      .populate('jobId', 'title') as unknown as PopulatedApplication;

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized (company or admin)
    const isCompany = application.companyId._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Only companies can schedule interviews' },
        { status: 401 }
      );
    }

    // Create interview object
    const interviewDateTime = new Date(`${validation.data.date}T${validation.data.time}`);

    const interview: IInterview = {
      scheduled: true,
      date: interviewDateTime,
      type: validation.data.type,
      duration: validation.data.duration,
      link: validation.data.link,
      location: validation.data.location,
      notes: validation.data.notes,
      interviewer: validation.data.interviewer || session.user.name,
      attendees: validation.data.attendees || [],
      status: 'scheduled',
      createdAt: new Date(),
      createdBy: session.user.id,
    };

    // Update application
    application.interview = interview;
    application.status = 'interview_scheduled';
    await application.save();

    // Get the title safely
    const positionTitle = application.type === 'project'
      ? application.projectId?.title
      : application.jobId?.title;

    // Create notification for applicant
    await Notification.create({
      userId: application.applicantId._id,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `An interview has been scheduled for your application to ${positionTitle || 'your position'}`,
      data: {
        applicationId: application._id,
        interviewDate: interviewDateTime,
        interviewType: validation.data.type,
        interviewLink: validation.data.link,
      },
      link: `/dashboard/student/applications/${application._id}`,
      category: 'application',
      priority: 'high',
    });

    // Send email notification
    try {
      const applicantUser = toIUser(application.applicantId);

      await sendInterviewInvitationEmail(
        applicantUser,
        positionTitle || 'Position',
        {
          date: interviewDateTime,
          time: validation.data.time,
          location: validation.data.location,
          meetingLink: validation.data.link,
          instructions: validation.data.notes,
        }
      );
    } catch (emailError) {
      console.error('Failed to send interview invitation email:', emailError);
    }

    return NextResponse.json({
      message: 'Interview scheduled successfully',
      interview: {
        date: interviewDateTime,
        type: validation.data.type,
        link: validation.data.link,
        duration: validation.data.duration,
      },
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get interview details
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
      .select('interview status')
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email') as unknown as PopulatedApplication;

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

    if (!application.interview) {
      return NextResponse.json(
        { error: 'No interview scheduled' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      interview: application.interview,
      status: application.status,
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update/reschedule interview
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
    const validation = interviewSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email') as unknown as PopulatedApplication;

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized (company or applicant)
    const isApplicant = application.applicantId?._id.toString() === session.user.id;
    const isCompany = application.companyId?._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!application.interview) {
      return NextResponse.json(
        { error: 'No interview scheduled' },
        { status: 404 }
      );
    }

    // Store old interview for notification
    const oldInterview = { ...application.interview } as IInterview;

    // Update interview fields
    if (validation.data.date && validation.data.time) {
      application.interview.date = new Date(`${validation.data.date}T${validation.data.time}`);
    }
    if (validation.data.type) application.interview.type = validation.data.type;
    if (validation.data.duration) application.interview.duration = validation.data.duration;
    if (validation.data.link) application.interview.link = validation.data.link;
    if (validation.data.location) application.interview.location = validation.data.location;
    if (validation.data.notes) application.interview.notes = validation.data.notes;

    application.interview.updatedAt = new Date();
    application.interview.updatedBy = session.user.id;
    application.interview.status = 'rescheduled';

    await application.save();

    // Notify the other party
    const notifyUserId = isApplicant ? application.companyId?._id : application.applicantId?._id;

    if (notifyUserId) {
      await Notification.create({
        userId: notifyUserId,
        type: 'interview_rescheduled',
        title: 'Interview Rescheduled',
        message: `The interview has been rescheduled by ${session.user.name}`,
        data: {
          applicationId: application._id,
          oldDate: oldInterview.date,
          newDate: application.interview.date,
        },
        link: `/dashboard/${isApplicant ? 'company' : 'student'}/applications/${application._id}`,
        category: 'application',
        priority: 'high',
      });
    }

    return NextResponse.json({
      message: 'Interview updated successfully',
      interview: application.interview,
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel interview
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

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email') as unknown as PopulatedApplication;

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized (company or applicant)
    const isApplicant = application.applicantId?._id.toString() === session.user.id;
    const isCompany = application.companyId?._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isApplicant && !isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!application.interview) {
      return NextResponse.json(
        { error: 'No interview scheduled' },
        { status: 404 }
      );
    }

    // Store interview for notification
    const cancelledInterview = { ...application.interview } as IInterview;

    // Remove interview
    application.interview = undefined;
    application.status = 'interview_cancelled';
    await application.save();

    // Notify the other party
    const notifyUserId = isApplicant ? application.companyId?._id : application.applicantId?._id;

    if (notifyUserId && cancelledInterview.date) {
      await Notification.create({
        userId: notifyUserId,
        type: 'interview_cancelled',
        title: 'Interview Cancelled',
        message: `The interview scheduled for ${new Date(cancelledInterview.date).toLocaleString()} has been cancelled.`,
        data: {
          applicationId: application._id,
          cancelledBy: session.user.name,
          originalDate: cancelledInterview.date,
        },
        link: `/dashboard/${isApplicant ? 'company' : 'student'}/applications/${application._id}`,
        category: 'application',
        priority: 'high',
      });
    }

    return NextResponse.json({
      message: 'Interview cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Submit interview feedback
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
    const validation = interviewFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.findById(params.id)
      .populate('applicantId', 'name email')
      .populate('companyId', 'name email') as unknown as PopulatedApplication;

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized (company)
    const isCompany = application.companyId?._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isCompany && !isAdmin) {
      return NextResponse.json(
        { error: 'Only companies can submit interview feedback' },
        { status: 401 }
      );
    }

    if (!application.interview) {
      return NextResponse.json(
        { error: 'No interview scheduled' },
        { status: 404 }
      );
    }

    // Update interview with feedback
    application.interview.feedback = validation.data.feedback;
    application.interview.rating = validation.data.rating;
    application.interview.recommendation = validation.data.recommendation;
    application.interview.nextSteps = validation.data.nextSteps;
    application.interview.completedAt = new Date();
    application.interview.status = 'completed';

    await application.save();

    // Notify applicant
    if (application.applicantId?._id) {
      await Notification.create({
        userId: application.applicantId._id,
        type: 'interview_feedback',
        title: 'Interview Feedback Submitted',
        message: 'The company has submitted feedback for your interview.',
        data: {
          applicationId: application._id,
          recommendation: validation.data.recommendation,
        },
        link: `/dashboard/student/applications/${application._id}`,
        category: 'application',
        priority: 'medium',
      });
    }

    return NextResponse.json({
      message: 'Interview feedback submitted successfully',
      feedback: {
        rating: validation.data.rating,
        recommendation: validation.data.recommendation,
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}