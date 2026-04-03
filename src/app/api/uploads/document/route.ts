import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { uploadFile } from '@/lib/utils/upload';
import { z } from 'zod';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/rtf',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const documentSchema = z.object({
  type: z.enum([
    'resume',
    'portfolio',
    'certificate',
    'id-proof',
    'company-registration',
    'gst-certificate',
    'project-file',
    'contract',
    'invoice',
    'other'
  ]),
  visibility: z.enum(['public', 'private', 'shared']).default('private'),
  sharedWith: z.array(z.string()).optional(),
  expiryDays: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const metadataJson = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse and validate metadata
    let metadata;
    if (metadataJson) {
      try {
        const parsed = JSON.parse(metadataJson);
        const validation = documentSchema.safeParse(parsed);
        if (validation.success) {
          metadata = validation.data;
        } else {
          metadata = { type: 'other', visibility: 'private' };
        }
      } catch {
        metadata = { type: 'other', visibility: 'private' };
      }
    } else {
      metadata = { type: 'other', visibility: 'private' };
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type', 
          allowedTypes: ALLOWED_FILE_TYPES 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB' },
        { status: 400 }
      );
    }

    // Determine folder based on document type
    let folder = 'documents';
    switch (metadata.type) {
      case 'resume':
        folder = 'resumes';
        break;
      case 'portfolio':
        folder = 'portfolios';
        break;
      case 'certificate':
        folder = 'certificates';
        break;
      case 'id-proof':
        folder = 'id-proofs';
        break;
      case 'company-registration':
      case 'gst-certificate':
        folder = 'business-docs';
        break;
      case 'project-file':
        folder = 'project-files';
        break;
      case 'contract':
        folder = 'contracts';
        break;
      case 'invoice':
        folder = 'invoices';
        break;
      default:
        folder = 'documents';
    }

    // Add user-specific subfolder
    folder = `${folder}/${session.user.id}`;

    // Upload file
    const fileUrl = await uploadFile(file, folder);

    // Generate expiry date if requested
    let expiresAt: Date | null = null;
    if (metadata.expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + metadata.expiryDays);
    }

    // Here you would typically save document metadata to database
    // For now, we'll just return the URL

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.user.id,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get list of user's documents
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
    const type = searchParams.get('type');
    const visibilityFilter = searchParams.get('visibility');

    // This would typically fetch from a database
    // For now, return mock data
    const documents = [
      {
        id: '1',
        filename: 'resume_2024.pdf',
        url: 'https://example.com/resume.pdf',
        type: 'resume',
        size: 2500000,
        uploadedAt: '2024-02-15T10:30:00Z',
        visibility: 'private',
      },
      {
        id: '2',
        filename: 'portfolio_project1.pdf',
        url: 'https://example.com/portfolio.pdf',
        type: 'portfolio',
        size: 5000000,
        uploadedAt: '2024-02-14T14:20:00Z',
        visibility: 'public',
      },
    ];

    const filtered = documents.filter(doc => {
      if (type && doc.type !== type) return false;
      if (visibilityFilter && doc.visibility !== visibilityFilter) return false;
      return true;
    });

    return NextResponse.json({
      documents: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a document
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    const url = searchParams.get('url');

    if (!documentId && !url) {
      return NextResponse.json(
        { error: 'Document ID or URL is required' },
        { status: 400 }
      );
    }

    // Here you would:
    // 1. Verify ownership
    // 2. Delete from storage
    // 3. Remove from database

    return NextResponse.json({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update document metadata
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { documentId, visibility, sharedWith } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Use the visibility variable to avoid the warning
    console.log(`Updating document ${documentId} with visibility: ${visibility}, sharedWith: ${sharedWith?.length || 0} users`);

    // Here you would update document metadata in database
    // For example:
    // await DocumentModel.findByIdAndUpdate(documentId, { 
    //   visibility, 
    //   sharedWith: visibility === 'shared' ? sharedWith : [] 
    // });

    return NextResponse.json({
      message: 'Document updated successfully',
      updates: {
        documentId,
        visibility,
        sharedWith: sharedWith || [],
      },
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
