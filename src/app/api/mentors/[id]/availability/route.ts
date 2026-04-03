import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const availabilitySchema = z.object({
  type: z.enum(['weekdays', 'evenings', 'weekends', 'flexible']),
  schedule: z.object({
    monday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
    tuesday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
    wednesday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
    thursday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
    friday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
    saturday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
    sunday: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
  }).optional(),
  timezone: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const mentor = await Mentor.findOne({ userId: params.id })
      .select('availability');

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ availability: mentor.availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
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
    
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Add default timezone if not provided
    if (!body.timezone) {
      body.timezone = 'Asia/Kolkata'; // Default from your model
    }

    const validation = availabilitySchema.safeParse(body);

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

    // Update availability with proper typing
    mentor.availability = {
      type: validation.data.type,
      schedule: validation.data.schedule,
      timezone: validation.data.timezone || 'Asia/Kolkata',
    };
    
    await mentor.save();

    return NextResponse.json({
      message: 'Availability updated successfully',
      availability: mentor.availability,
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}