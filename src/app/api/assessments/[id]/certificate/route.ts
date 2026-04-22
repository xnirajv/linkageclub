import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Assessment from '@/lib/db/models/assessment';
import User from '@/lib/db/models/user';
import connectDB from '@/lib/db/connect';
import PDFDocument from 'pdfkit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const assessment = await Assessment.findById(id);
    const user = await User.findById(session.user.id);

    if (!assessment || !user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Find user's attempt
    const attempt = assessment.attempts?.find(
      (a: any) => a.userId?.toString() === session.user.id && a.passed === true
    );

    if (!attempt) {
      return NextResponse.json({ error: 'No passed attempt found' }, { status: 404 });
    }

    // ✅ FIX: Handle null completedAt
    const completedDate = attempt.completedAt ? new Date(attempt.completedAt) : new Date();

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {});

    // Background
    doc.rect(0, 0, 842, 595).fill('#f5f0eb');
    
    // Border
    doc.lineWidth(10);
    doc.strokeColor('#344A86');
    doc.rect(30, 30, 782, 535).stroke();

    // Inner border
    doc.lineWidth(2);
    doc.strokeColor('#407794');
    doc.rect(40, 40, 762, 515).stroke();

    // Title
    doc.fontSize(48);
    doc.fillColor('#344A86');
    doc.font('Helvetica-Bold');
    doc.text('CERTIFICATE', 421, 120, { align: 'center' });

    doc.fontSize(16);
    doc.fillColor('#407794');
    doc.font('Helvetica');
    doc.text('OF COMPLETION', 421, 165, { align: 'center' });

    // Line separator
    doc.moveTo(200, 200).lineTo(642, 200).stroke();

    // Body text
    doc.fontSize(14);
    doc.fillColor('#333333');
    doc.text('This is to certify that', 421, 240, { align: 'center' });

    // User name
    doc.fontSize(28);
    doc.fillColor('#344A86');
    doc.font('Helvetica-Bold');
    doc.text(user.name, 421, 275, { align: 'center' });

    doc.fontSize(14);
    doc.fillColor('#333333');
    doc.font('Helvetica');
    doc.text('has successfully completed the assessment', 421, 330, { align: 'center' });

    // Assessment title
    doc.fontSize(22);
    doc.fillColor('#407794');
    doc.font('Helvetica-Bold');
    doc.text(assessment.title, 421, 370, { align: 'center' });

    // Score
    doc.fontSize(14);
    doc.fillColor('#333333');
    doc.font('Helvetica');
    doc.text(`with a score of ${attempt.score}%`, 421, 420, { align: 'center' });

    // Date - ✅ FIXED: Use completedDate variable
    const date = completedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.fontSize(11);
    doc.fillColor('#666666');
    doc.text(`Date: ${date}`, 421, 480, { align: 'center' });

    // Signature
    doc.fontSize(10);
    doc.text('Authorized Signature', 680, 520);
    doc.moveTo(620, 525).lineTo(780, 525).stroke();

    doc.end();

    // Wait for PDF to finish
    await new Promise((resolve) => {
      doc.on('end', resolve);
    });

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=certificate_${assessment.title.replace(/\s/g, '_')}.pdf`,
      },
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}