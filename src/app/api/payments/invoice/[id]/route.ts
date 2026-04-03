import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import Payment from '@/lib/db/models/payment';
import connectDB from '@/lib/db/connect';
import { generateInvoiceNumber } from '@/lib/utils/generateToken';
import { formatCurrency } from '@/lib/utils/format';
import mongoose from 'mongoose';

// Define interfaces for populated documents
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

// Define the populated payment type
interface PopulatedPayment {
  _id: mongoose.Types.ObjectId;
  userId: PopulatedUser;
  recipientId?: PopulatedUser;
  purpose: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  paymentMethod: {
    type: string;
  };
  fees: {
    platformFee: number;
    tax: number;
  };
  createdAt: Date;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const payment = await Payment.findById(params.id)
      .populate('userId', 'name email')
      .populate('recipientId', 'name email') as unknown as PopulatedPayment;

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this invoice
    const isSender = payment.userId._id.toString() === session.user.id;
    const isRecipient = payment.recipientId?._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isSender && !isRecipient && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: generateInvoiceNumber(),
      date: payment.createdAt,
      dueDate: payment.createdAt,
      from: {
        name: 'InternHub',
        email: 'finance@internhub.com',
        address: 'Bengaluru, Karnataka, India',
        gst: '29ABCDE1234F1Z5',
      },
      to: {
        name: payment.userId.name,
        email: payment.userId.email,
      },
      items: [
        {
          description: payment.purpose,
          quantity: 1,
          unitPrice: payment.amount,
          amount: payment.amount,
        },
      ],
      subtotal: payment.amount,
      platformFee: payment.fees.platformFee,
      tax: payment.fees.tax,
      total: payment.amount,
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.transactionId,
      paymentMethod: payment.paymentMethod.type,
    };

    // Generate HTML invoice
    const html = generateInvoiceHTML(invoice);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #344A86;
        }
        .header h1 {
          color: #344A86;
          margin: 0;
          font-size: 32px;
        }
        .header p {
          color: #666;
          margin: 5px 0 0;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-info div {
          flex: 1;
        }
        .invoice-info h3 {
          color: #344A86;
          margin: 0 0 10px;
          font-size: 16px;
        }
        .invoice-info p {
          margin: 5px 0;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        th {
          background: #344A86;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 14px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .totals {
          text-align: right;
          margin-top: 30px;
        }
        .totals div {
          margin: 5px 0;
        }
        .totals .grand-total {
          font-size: 18px;
          font-weight: bold;
          color: #344A86;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status.completed {
          background: #407794;
          color: white;
        }
        .status.pending {
          background: #C2964B;
          color: white;
        }
        .status.processing {
          background: #344A86;
          color: white;
        }
        .status.refunded {
          background: #A3A3A3;
          color: white;
        }
        .status.failed {
          background: #4B4945;
          color: white;
        }
        .status.cancelled {
          background: #A3A3A3;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>InternHub</h1>
        <p>Invoice</p>
      </div>

      <div class="invoice-info">
        <div>
          <h3>Invoice To:</h3>
          <p><strong>${invoice.to.name}</strong></p>
          <p>${invoice.to.email}</p>
        </div>
        <div>
          <h3>From:</h3>
          <p><strong>${invoice.from.name}</strong></p>
          <p>${invoice.from.email}</p>
          <p>${invoice.from.address}</p>
          <p>GST: ${invoice.from.gst}</p>
        </div>
        <div style="text-align: right;">
          <h3>Invoice Details:</h3>
          <p><strong>Invoice No:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong>Transaction ID:</strong> ${invoice.transactionId}</p>
          <p><span class="status ${invoice.status}">${invoice.status.toUpperCase()}</span></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unitPrice, invoice.currency)}</td>
              <td>${formatCurrency(item.amount, invoice.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div><strong>Subtotal:</strong> ${formatCurrency(invoice.subtotal, invoice.currency)}</div>
        <div><strong>Platform Fee:</strong> ${formatCurrency(invoice.platformFee, invoice.currency)}</div>
        <div><strong>GST (18%):</strong> ${formatCurrency(invoice.tax, invoice.currency)}</div>
        <div class="grand-total"><strong>Total:</strong> ${formatCurrency(invoice.total, invoice.currency)}</div>
        <div><small>Payment Method: ${invoice.paymentMethod}</small></div>
      </div>

      <div class="footer">
        <p>Thank you for using InternHub!</p>
        <p>This is a system generated invoice and does not require a signature.</p>
        <p>For any queries, contact finance@internhub.com</p>
      </div>
    </body>
    </html>
  `;
}
