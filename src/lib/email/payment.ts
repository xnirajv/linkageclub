import { sendEmail } from '@/lib/utils/sendEmail';
import { formatCurrency, formatDate } from '@/lib/utils/format';

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  data: {
    amount: number;
    transactionId: string;
    date: Date;
  }
) {
  const subject = 'Payment Confirmation - SkillBridge';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #344A86; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .button { display: inline-block; background: #344A86; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Successful!</h1>
        </div>
        <div class="content">
          <div class="success-icon">✅</div>
          <p>Your payment has been processed successfully.</p>
          
          <div class="details">
            <div class="detail-row">
              <strong>Amount:</strong>
              <span>${formatCurrency(data.amount)}</span>
            </div>
            <div class="detail-row">
              <strong>Transaction ID:</strong>
              <span>${data.transactionId}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${formatDate(data.date)}</span>
            </div>
          </div>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/student/payments" class="button">
              View Transaction Details
            </a>
          </p>

          <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  to: string,
  data: {
    amount: number;
    reason?: string;
  }
) {
  const subject = 'Payment Failed - SkillBridge';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .error-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .button { display: inline-block; background: #344A86; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <div class="error-icon">❌</div>
          <p>We couldn't process your payment of ${formatCurrency(data.amount)}.</p>
          
          ${data.reason ? `
            <div class="details">
              <strong>Reason:</strong>
              <p>${data.reason}</p>
            </div>
          ` : ''}

          <p>Please try again or use a different payment method.</p>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/student/payments" class="button">
              Try Again
            </a>
          </p>

          <p>If you continue to experience issues, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * Send payout confirmation email
 */
export async function sendPayoutConfirmationEmail(
  to: string,
  data: {
    amount: number;
    accountNumber: string;
    date: Date;
  }
) {
  const subject = 'Payout Initiated - SkillBridge';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #407794; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payout Initiated</h1>
        </div>
        <div class="content">
          <p>Your withdrawal request has been initiated and will be processed within 2-3 business days.</p>
          
          <div class="details">
            <div class="detail-row">
              <strong>Amount:</strong>
              <span>${formatCurrency(data.amount)}</span>
            </div>
            <div class="detail-row">
              <strong>Account:</strong>
              <span>****${data.accountNumber.slice(-4)}</span>
            </div>
            <div class="detail-row">
              <strong>Initiated:</strong>
              <span>${formatDate(data.date)}</span>
            </div>
          </div>

          <p>You will receive a confirmation email once the payout is processed.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

/**
 * Send refund processed email
 */
export async function sendRefundProcessedEmail(
  to: string,
  data: {
    amount: number;
    transactionId: string;
    date: Date;
  }
) {
  const subject = 'Refund Processed - SkillBridge';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #344A86; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Processed</h1>
        </div>
        <div class="content">
          <p>Your refund has been processed successfully.</p>
          
          <div class="details">
            <div class="detail-row">
              <strong>Amount:</strong>
              <span>${formatCurrency(data.amount)}</span>
            </div>
            <div class="detail-row">
              <strong>Transaction ID:</strong>
              <span>${data.transactionId}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${formatDate(data.date)}</span>
            </div>
          </div>

          <p>The refunded amount will be credited to your original payment method within 5-7 business days.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to, subject, html });
}

export default {
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
  sendPayoutConfirmationEmail,
  sendRefundProcessedEmail,
};
