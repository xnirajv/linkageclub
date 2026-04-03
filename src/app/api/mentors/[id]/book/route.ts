import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { z } from 'zod';
import mongoose from 'mongoose';

const bookingSchema = z.object({
  date: z.string(),
  duration: z.number().min(30).max(180),
  topic: z.string().min(5),
  description: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can book mentor sessions' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = bookingSchema.safeParse(body);

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

    // Check if mentor is available at that time
    const bookingDate = new Date(validation.data.date);
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof NonNullable<typeof mentor.availability.schedule>;
    
    const availableSlots = mentor.availability?.schedule?.[dayOfWeek];
    
    if (!availableSlots || availableSlots.length === 0) {
      return NextResponse.json(
        { error: 'Mentor is not available on this day' },
        { status: 400 }
      );
    }

    // Check if time slot is available
    const bookingTime = bookingDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const isSlotAvailable = availableSlots.some((slot) => {
      return bookingTime >= slot.start && bookingTime <= slot.end;
    });

    if (!isSlotAvailable) {
      return NextResponse.json(
        { error: 'Selected time slot is not available' },
        { status: 400 }
      );
    }

    // Check for conflicts with existing sessions
    const conflictingSession = mentor.sessions?.find((s) => {
      const sessionDate = new Date(s.date);
      const timeDiff = Math.abs(sessionDate.getTime() - bookingDate.getTime());
      return timeDiff < validation.data.duration * 60 * 1000;
    });

    if (conflictingSession) {
      return NextResponse.json(
        { error: 'This time slot conflicts with an existing session' },
        { status: 400 }
      );
    }

    // Calculate amount
    const amount = mentor.hourlyRate * (validation.data.duration / 60);

    // Create session
    const newSession = {
      _id: new mongoose.Types.ObjectId(),
      studentId: new mongoose.Types.ObjectId(session.user.id),
      topic: validation.data.topic,
      description: validation.data.description || '', // Default empty string
      date: bookingDate,
      duration: validation.data.duration,
      status: 'scheduled' as const,
      amount,
      paymentStatus: 'pending' as const,
      createdAt: new Date(),
    };

    // Initialize sessions array if it doesn't exist
    if (!mentor.sessions) {
      mentor.sessions = [];
    }

    mentor.sessions.push(newSession);
    await mentor.save();

    // Create payment record
    const Payment = (await import('@/lib/db/models/payment')).default;
    await Payment.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      recipientId: new mongoose.Types.ObjectId(params.id),
      type: 'mentorship',
      purpose: `Mentor Session: ${validation.data.topic}`,
      amount,
      currency: 'INR',
      status: 'pending',
      paymentMethod: { type: 'razorpay' },
      sessionId: newSession._id,
    });

    return NextResponse.json({
      message: 'Session booked successfully',
      session: {
        id: newSession._id,
        topic: newSession.topic,
        date: newSession.date,
        duration: newSession.duration,
        amount: newSession.amount,
        status: newSession.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error booking session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}