import { IPayment } from '@/types/payment';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { IUser } from '../db/models/user';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  payment: IPayment;
  from: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
    gst?: string;
  };
  to: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
    gst?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(paymentId: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const id = paymentId.slice(-6).toUpperCase();
  
  return `INV-${year}${month}-${id}`;
}

/**
 * Generate invoice data from payment
 */
export function generateInvoiceData(
  payment: IPayment,
  payer: IUser,
  _payee: IUser
): InvoiceData {
  const invoiceNumber = generateInvoiceNumber(payment._id.toString());
  const invoiceDate = new Date(payment.createdAt);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 7); // 7 days payment term

  // Calculate tax (18% GST for India)
  const subtotal = payment.amount;
  const taxRate = 0.18;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const items = [
    {
      description: payment.description || 'Service Fee',
      quantity: 1,
      rate: subtotal,
      amount: subtotal,
    },
  ];

  // Add platform fee if applicable
  if (payment.fees?.platformFee && payment.fees.platformFee > 0) {
    items.push({
      description: 'Platform Fee',
      quantity: 1,
      rate: payment.fees.platformFee,
      amount: payment.fees.platformFee,
    });
  }

  return {
    invoiceNumber,
    invoiceDate,
    dueDate,
    payment,
    from: {
      name: 'SkillBridge Platform',
      email: 'billing@skillbridge.com',
      address: 'Ahmedabad, Gujarat, India',
      phone: '+91 1234567890',
      gst: 'GSTIN1234567890',
    },
    to: {
      name: payer.name,
      email: payer.email,
      address: payer.location,
      phone: payer.phone,
    },
    items,
    subtotal,
    tax,
    total,
    notes: 'Thank you for your business!',
  };
}

/**
 * Generate invoice HTML
 */
export function generateInvoiceHTML(invoice: InvoiceData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #344A86; }
    .invoice-details { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; margin-bottom: 8px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .party-info { background: #FAF9F7; padding: 20px; border-radius: 8px; }
    .party-info p { margin-bottom: 4px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .table tr:last-child td { border-bottom: none; }
    .text-right { text-align: right; }
    .totals { margin-top: 30px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 12px; }
    .notes { background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 30px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SkillBridge</div>
      <div class="invoice-details">
        <div class="invoice-number">INVOICE</div>
        <div>#${invoice.invoiceNumber}</div>
        <div style="margin-top: 8px;">
          <div>Date: ${formatDate(invoice.invoiceDate)}</div>
          <div>Due: ${formatDate(invoice.dueDate)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">From</div>
      <div class="party-info">
        <p><strong>${invoice.from.name}</strong></p>
        <p>${invoice.from.email}</p>
        ${invoice.from.address ? `<p>${invoice.from.address}</p>` : ''}
        ${invoice.from.phone ? `<p>${invoice.from.phone}</p>` : ''}
        ${invoice.from.gst ? `<p>GST: ${invoice.from.gst}</p>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Bill To</div>
      <div class="party-info">
        <p><strong>${invoice.to.name}</strong></p>
        <p>${invoice.to.email}</p>
        ${invoice.to.address ? `<p>${invoice.to.address}</p>` : ''}
        ${invoice.to.phone ? `<p>${invoice.to.phone}</p>` : ''}
        ${invoice.to.gst ? `<p>GST: ${invoice.to.gst}</p>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Items</div>
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.rate)}</td>
              <td class="text-right">${formatCurrency(item.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div style="max-width: 400px; margin-left: auto;">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        <div class="total-row">
          <span>Tax (18% GST):</span>
          <span>${formatCurrency(invoice.tax)}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total:</span>
          <span>${formatCurrency(invoice.total)}</span>
        </div>
      </div>
    </div>

    ${invoice.notes ? `
      <div class="notes">
        <strong>Notes:</strong><br>
        ${invoice.notes}
      </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>For questions, contact billing@skillbridge.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate invoice PDF (requires a PDF generation library)
 */
export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
  // This would integrate with a PDF generation library like puppeteer or pdfkit
  throw new Error('PDF generation requires additional library');
}

export default {
  generateInvoiceNumber,
  generateInvoiceData,
  generateInvoiceHTML,
  generateInvoicePDF,
};
