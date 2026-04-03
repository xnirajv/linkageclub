import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose';

const resourceSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  type: z.enum(['article', 'video', 'course', 'template', 'other']),
  url: z.string().url(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const mentor = await Mentor.findOne({ userId: params.id }).select('resources');

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ resources: mentor.resources || [] });
  } catch (error) {
    console.error('Error fetching resources:', error);
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
    
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = resourceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const mentor = await Mentor.findOne({ userId: params.id });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Initialize resources array if it doesn't exist
    if (!mentor.resources) {
      mentor.resources = [];
    }

    // Create new resource with _id
    const newResource = {
      _id: new mongoose.Types.ObjectId(),
      title: validation.data.title,
      description: validation.data.description || '',
      type: validation.data.type,
      url: validation.data.url,
      tags: validation.data.tags || [],
      downloads: 0,
      createdAt: new Date(),
    };

    mentor.resources.push(newResource);
    await mentor.save();

    return NextResponse.json({
      message: 'Resource added successfully',
      resource: newResource,
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding resource:', error);
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
    
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const mentor = await Mentor.findOne({ userId: params.id });

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Ensure resources array exists
    if (!mentor.resources) {
      mentor.resources = [];
    }

    // Filter out the resource with matching _id
    const initialLength = mentor.resources.length;
    mentor.resources = mentor.resources.filter(
      (r: any) => r._id && r._id.toString() !== resourceId
    );

    // Check if any resource was actually deleted
    if (mentor.resources.length === initialLength) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    await mentor.save();

    return NextResponse.json({
      message: 'Resource deleted successfully',
      resources: mentor.resources,
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}