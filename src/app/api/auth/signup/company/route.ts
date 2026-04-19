import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import { sendVerificationEmail } from '@/lib/email/verification';
import { z } from 'zod';
import { generateToken } from '@/lib/utils/generateToken';

const companySchema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  website: z.string().url(),
  industry: z.string(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
  location: z.string().min(2),
  description: z.string().min(100),
  foundedYear: z.string(),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  console.log('1. Company signup API called');
  
  try {
    console.log('2. Connecting to DB...');
    await connectDB();
    console.log('3. DB connected');

    console.log('4. Getting formData...');
    const formData = await req.formData();
    console.log('5. FormData received');

    const data: any = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
      console.log(`6. Field: ${key} = ${value}`);
    }

    console.log('7. Validating data...');
    const validation = companySchema.safeParse(data);

    if (!validation.success) {
      console.log('8. Validation failed:', JSON.stringify(validation.error.errors, null, 2));
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }
    console.log('9. Validation passed');

    const { 
      companyName, email, password, website, 
      location, description, linkedin, twitter 
    } = validation.data;
    console.log(`10. Extracted: companyName=${companyName}, email=${email}`);

    console.log('11. Checking existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('12. User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    console.log('13. User does not exist');

    console.log('14. Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('15. Password hashed');

    console.log('16. Generating token...');
    const verificationToken = generateToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);
    console.log('17. Token generated');

    console.log('18. Creating user...');
    const user = await User.create({
      name: companyName,
      email,
      password: hashedPassword,
      role: 'company',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      bio: description,
      location,
      socialLinks: {
        linkedin,
        twitter,
        portfolio: website,
      },
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
    console.log(`19. User created with id: ${user._id}`);

    console.log('20. Sending verification email...');
    try {
      await sendVerificationEmail(email, verificationToken, companyName);
      console.log('21. Email sent successfully');
    } catch (emailError) {
      console.error('21. Email failed:', emailError);
    }

    console.log('22. Sending success response');
    return NextResponse.json(
      {
        message: 'Company account created successfully. Please verify your email.',
        userId: user._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('ERROR at step:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}