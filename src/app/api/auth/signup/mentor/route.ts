import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/user';
import Mentor from '@/lib/db/models/mentor';
import connectDB from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/email/verification';
import { generateToken } from '@/lib/utils/generateToken';
import { z } from 'zod';

const mentorSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  currentRole: z.string().min(2),
  currentCompany: z.string().min(2),
  expertise: z.array(z.string()).min(3),
  yearsOfExperience: z.string(),
  hourlyRate: z.string(),
  bio: z.string().min(200),
  linkedin: z.string().url(),
  github: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  availability: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = mentorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { fullName, email, password, currentRole, currentCompany, expertise, yearsOfExperience, hourlyRate, bio, linkedin, github, portfolio, availability } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Create user
    const user = await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: 'mentor',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      bio,
      socialLinks: {
        linkedin,
        github,
        portfolio,
      },
      skills: expertise.map(skill => ({
        name: skill,
        level: 'expert',
        verified: false,
      })),
      preferences: {
        newsletter: true,
      },
      stats: {
        projectsCompleted: 0,
        totalEarnings: 0,
        averageRating: 0,
        reviewsCount: 0,
        sessionsAttended: 0,
        daysActive: 1,
      },
    });

    // Create mentor profile
    await Mentor.create({
      userId: user._id,
      expertise: expertise.map(skill => ({
        skill,
        level: 'expert',
        yearsOfExperience: parseInt(yearsOfExperience),
        verified: false,
      })),
      hourlyRate: parseInt(hourlyRate),
      currentRole,
      currentCompany,
      availability: {
        type: availability,
        timezone: 'Asia/Kolkata',
      },
      stats: {
        totalSessions: 0,
        completedSessions: 0,
        cancelledSessions: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalReviews: 0,
        responseRate: 100,
        responseTime: 0,
        repeatStudents: 0,
      },
      isVerified: false,
      isActive: true,
      joinedAt: new Date(),
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, fullName);
    } catch (error) {
      console.error('Mentor email send failed:', error);
    }

    return NextResponse.json(
      {
        message: 'Mentor account created successfully. Please verify your email.',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mentor signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}