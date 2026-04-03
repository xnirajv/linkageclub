import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';

const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

const weeklyScheduleSchema = z.object({
  monday: z.array(timeSlotSchema).optional(),
  tuesday: z.array(timeSlotSchema).optional(),
  wednesday: z.array(timeSlotSchema).optional(),
  thursday: z.array(timeSlotSchema).optional(),
  friday: z.array(timeSlotSchema).optional(),
  saturday: z.array(timeSlotSchema).optional(),
  sunday: z.array(timeSlotSchema).optional(),
});

const availabilitySchema = z.object({
  type: z.enum(['weekdays', 'evenings', 'weekends', 'flexible']),
  schedule: weeklyScheduleSchema.optional(),
  timezone: z.string(),
  exceptions: z.array(z.object({
    date: z.string(),
    available: z.boolean(),
    slots: z.array(timeSlotSchema).optional(),
  })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const mentorId = searchParams.get('mentorId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    let query: any = {};
    
    if (mentorId) {
      query.userId = mentorId;
    } else if (session.user.role === 'mentor') {
      query.userId = session.user.id;
    } else {
      return NextResponse.json(
        { error: 'Mentor ID required' },
        { status: 400 }
      );
    }

    const mentor = await Mentor.findOne(query).select('availability') as any;

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // If date range is provided, check availability for each day
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const availabilityMap = new Map();

      // Generate array of dates in range
      const dates: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      // Check each date
      for (const date of dates) {
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dateStr = date.toISOString().split('T')[0];
        
        // Check for exceptions first
        const exception = mentor.availability?.exceptions?.find(
          (e: any) => e.date === dateStr
        );

        if (exception) {
          availabilityMap.set(dateStr, {
            available: exception.available,
            slots: exception.slots || [],
          });
        } else {
          // Use weekly schedule
          const daySchedule = mentor.availability?.schedule?.[dayOfWeek];
          availabilityMap.set(dateStr, {
            available: !!(daySchedule && daySchedule.length > 0),
            slots: daySchedule || [],
          });
        }
      }

      return NextResponse.json({
        availability: Object.fromEntries(availabilityMap),
      });
    }

    // If single date is provided
    if (date) {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dateStr = targetDate.toISOString().split('T')[0];

      // Check for exceptions
      const exception = mentor.availability?.exceptions?.find(
        (e: any) => e.date === dateStr
      );

      if (exception) {
        return NextResponse.json({
          date: dateStr,
          available: exception.available,
          slots: exception.slots || [],
        });
      }

      // Use weekly schedule
      const daySchedule = mentor.availability?.schedule?.[dayOfWeek];
      
      return NextResponse.json({
        date: dateStr,
        available: !!(daySchedule && daySchedule.length > 0),
        slots: daySchedule || [],
      });
    }

    // Return full availability settings
    return NextResponse.json({
      availability: mentor.availability,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Only mentors can set availability' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = availabilitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    await connectDB();

    const mentor = await Mentor.findOne({ userId: session.user.id }) as any;

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    mentor.availability = validation.data;
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

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Only mentors can update availability' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, schedule, timezone, exceptions } = body;

    await connectDB();

    const mentor = await Mentor.findOne({ userId: session.user.id }) as any;

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    // Initialize availability if it doesn't exist
    if (!mentor.availability) {
      mentor.availability = {};
    }

    // Update only provided fields
    if (type) mentor.availability.type = type;
    if (schedule) mentor.availability.schedule = schedule;
    if (timezone) mentor.availability.timezone = timezone;
    if (exceptions) mentor.availability.exceptions = exceptions;

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

// Add an exception (time off)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Only mentors can add exceptions' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { date, available, slots } = body;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const mentor = await Mentor.findOne({ userId: session.user.id }) as any;

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    // Initialize availability and exceptions if they don't exist
    if (!mentor.availability) {
      mentor.availability = {};
    }
    
    if (!mentor.availability.exceptions) {
      mentor.availability.exceptions = [];
    }

    // Check if exception already exists for this date
    const existingIndex = mentor.availability.exceptions.findIndex(
      (e: any) => e.date === date
    );

    const exception = { date, available, slots: slots || [] };

    if (existingIndex >= 0) {
      mentor.availability.exceptions[existingIndex] = exception;
    } else {
      mentor.availability.exceptions.push(exception);
    }

    await mentor.save();

    return NextResponse.json({
      message: 'Exception added successfully',
      exceptions: mentor.availability.exceptions,
    });
  } catch (error) {
    console.error('Error adding exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove an exception
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'mentor') {
      return NextResponse.json(
        { error: 'Only mentors can remove exceptions' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const mentor = await Mentor.findOne({ userId: session.user.id }) as any;

    if (!mentor) {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    if (mentor.availability?.exceptions) {
      mentor.availability.exceptions = mentor.availability.exceptions.filter(
        (e: any) => e.date !== date
      );
      await mentor.save();
    }

    return NextResponse.json({
      message: 'Exception removed successfully',
      exceptions: mentor.availability?.exceptions || [],
    });
  } catch (error) {
    console.error('Error removing exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
