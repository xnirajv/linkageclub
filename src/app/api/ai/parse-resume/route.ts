import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { extractTextFromPDF } from '@/lib/utils/pdf';
import { parseResume } from '@/lib/ai/resumeParser';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await extractTextFromPDF(buffer);

    // Parse the resume text
    const parsedResume = await parseResume(text);

    // Return the parsed data
    return NextResponse.json({
      success: true,
      data: parsedResume
    });

  } catch (error) {
    console.error('Error parsing resume:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('PDF')) {
        return NextResponse.json(
          { error: 'Invalid PDF file. Please upload a valid PDF.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to parse resume. Please try again.' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check if the service is available
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume parsing service is available',
      supportedFormats: ['PDF'],
      maxFileSize: '5MB'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 500 }
    );
  }
}

// Optional: Add a HEAD endpoint for CORS preflight
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Optional: Add OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}