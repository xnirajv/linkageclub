import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Project from '@/lib/db/models/project';
import Application from '@/lib/db/models/application';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';

// Define extended type for project with application status
interface ProjectWithApplicationStatus {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  companyId: any;
  status: string;
  applicationStatus?: string;
  [key: string]: any;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.id !== params.userId && session.user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const role = searchParams.get('role');

    let projects: ProjectWithApplicationStatus[] = [];

    if (role === 'company') {
      const query: any = { companyId: params.userId };
      
      if (type === 'active') {
        query.status = { $in: ['open', 'in_progress'] };
      } else if (type === 'completed') {
        query.status = 'completed';
      }

      const foundProjects = await Project.find(query)
        .sort({ createdAt: -1 });
      
      projects = foundProjects.map(project => project.toObject() as ProjectWithApplicationStatus);
    } else {
      const applications = await Application.find({
        applicantId: params.userId,
        type: 'project',
      }).select('projectId status');

      const validApplications = applications.filter(app => app.projectId);
      const projectIds = validApplications.map(app => app.projectId);

      if (projectIds.length === 0) {
        return NextResponse.json({ projects: [] });
      }

      const query: any = { _id: { $in: projectIds } };
      
      if (type === 'active') {
        query.status = { $in: ['open', 'in_progress'] };
      } else if (type === 'completed') {
        query.status = 'completed';
      }

      const foundProjects = await Project.find(query)
        .populate('companyId', 'name avatar companyName');

      projects = foundProjects.map(project => {
        const projectObj = project.toObject() as ProjectWithApplicationStatus;
        const application = validApplications.find(
          app => app.projectId?.toString() === project._id.toString()
        );
        if (application) {
          projectObj.applicationStatus = application.status;
        }
        return projectObj;
      });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}