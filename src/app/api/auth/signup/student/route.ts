import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/email/verification';
import { generateToken } from '@/lib/utils/generateToken';
import { z } from 'zod';

const studentSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { fullName, email, password } = validation.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const verificationToken = generateToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const user = await User.create({
      name: fullName,
      email,
      password,
      role: 'student',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      emailVerified: false,
      lastActive: new Date(),
    });

    // Non-blocking email - fire and forget
    try {
      await sendVerificationEmail(email, verificationToken, fullName);
    } catch (error) {
      console.error('Email send error:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}