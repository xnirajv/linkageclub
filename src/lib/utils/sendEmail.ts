import nodemailer from 'nodemailer';

/**
 * Email sending utilities for various notifications
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const mailOptions = {
      from: options.from || `"InternHub" <${process.env.SMTP_FROM || 'noreply@internhub.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  const template = getWelcomeEmailTemplate(name, role);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  const template = getVerificationEmailTemplate(name, verificationUrl);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  const template = getPasswordResetEmailTemplate(name, resetUrl);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send application received email
 */
export async function sendApplicationReceivedEmail(
  email: string,
  name: string,
  projectTitle: string,
  companyName: string
): Promise<{ success: boolean; error?: string }> {
  const template = getApplicationReceivedTemplate(name, projectTitle, companyName);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send application status update email
 */
export async function sendApplicationStatusEmail(
  email: string,
  name: string,
  projectTitle: string,
  status: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  const template = getApplicationStatusTemplate(name, projectTitle, status, message);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send interview invitation email
 */
export async function sendInterviewInvitationEmail(
  email: string,
  name: string,
  companyName: string,
  date: string,
  time: string,
  type: string,
  link?: string
): Promise<{ success: boolean; error?: string }> {
  const template = getInterviewInvitationTemplate(name, companyName, date, time, type, link);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  amount: number,
  purpose: string,
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  const template = getPaymentConfirmationTemplate(name, amount, purpose, transactionId);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send withdrawal confirmation email
 */
export async function sendWithdrawalConfirmationEmail(
  email: string,
  name: string,
  amount: number,
  method: string,
  reference: string
): Promise<{ success: boolean; error?: string }> {
  const template = getWithdrawalConfirmationTemplate(name, amount, method, reference);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send mentor session booking email
 */
export async function sendSessionBookingEmail(
  studentEmail: string,
  studentName: string,
  mentorName: string,
  date: string,
  time: string,
  topic: string,
  meetingLink?: string
): Promise<{ success: boolean; error?: string }> {
  const template = getSessionBookingTemplate(studentName, mentorName, date, time, topic, meetingLink);
  
  const result = await sendEmail({
    to: studentEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send mentor session reminder email
 */
export async function sendSessionReminderEmail(
  email: string,
  name: string,
  mentorName: string,
  date: string,
  time: string,
  meetingLink?: string
): Promise<{ success: boolean; error?: string }> {
  const template = getSessionReminderTemplate(name, mentorName, date, time, meetingLink);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send project milestone completion email
 */
export async function sendMilestoneCompletedEmail(
  email: string,
  name: string,
  projectTitle: string,
  milestoneTitle: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const template = getMilestoneCompletedTemplate(name, projectTitle, milestoneTitle, amount);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send new message notification email
 */
export async function sendNewMessageEmail(
  email: string,
  name: string,
  senderName: string,
  messagePreview: string,
  conversationUrl: string
): Promise<{ success: boolean; error?: string }> {
  const template = getNewMessageTemplate(name, senderName, messagePreview, conversationUrl);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Send review received email
 */
export async function sendReviewReceivedEmail(
  email: string,
  name: string,
  reviewerName: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  const template = getReviewReceivedTemplate(name, reviewerName, rating, comment);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  
  return {
    success: result.success,
    error: result.error,
  };
}

/**
 * Get welcome email template
 */
function getWelcomeEmailTemplate(name: string, role: string): EmailTemplate {
  const subject = `Welcome to InternHub, ${name}!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to InternHub</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #344A86, #407794); border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 40px 30px; border: 1px solid #E1DDD6; border-top: none; border-radius: 0 0 8px 8px; }
        h1 { color: #1e293b; font-size: 24px; margin-bottom: 20px; }
        p { color: #475569; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #344A86, #407794); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .footer { text-align: center; padding-top: 30px; color: #6E6B66; font-size: 14px; border-top: 1px solid #E1DDD6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.NEXTAUTH_URL}/logo-white.svg" alt="InternHub" style="width: 150px; height: auto;">
        </div>
        <div class="content">
          <h1>Welcome to InternHub, ${name}!</h1>
          <p>We're thrilled to have you join our community as a <strong>${role}</strong>.</p>
          <p>Here's what you can do next:</p>
          <ul style="margin-bottom: 30px;">
            <li>Complete your profile to increase visibility</li>
            <li>Browse projects and opportunities</li>
            <li>Connect with mentors and peers</li>
            <li>Take skill assessments to earn badges</li>
          </ul>
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} InternHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Welcome to InternHub, ${name}!
    
    We're thrilled to have you join our community as a ${role}.
    
    Here's what you can do next:
    - Complete your profile to increase visibility
    - Browse projects and opportunities
    - Connect with mentors and peers
    - Take skill assessments to earn badges
    
    Visit your dashboard: ${process.env.NEXTAUTH_URL}/dashboard
  `;
  
  return { subject, html, text };
}

/**
 * Get verification email template
 */
function getVerificationEmailTemplate(name: string, url: string): EmailTemplate {
  const subject = `Verify your email address`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #344A86, #407794); border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 40px 30px; border: 1px solid #E1DDD6; border-top: none; border-radius: 0 0 8px 8px; }
        h1 { color: #1e293b; font-size: 24px; margin-bottom: 20px; }
        p { color: #475569; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #344A86, #407794); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .footer { text-align: center; padding-top: 30px; color: #6E6B66; font-size: 14px; border-top: 1px solid #E1DDD6; }
        .note { background: #FAF9F7; padding: 15px; border-radius: 6px; font-size: 14px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.NEXTAUTH_URL}/logo-white.svg" alt="InternHub" style="width: 150px; height: auto;">
        </div>
        <div class="content">
          <h1>Hello ${name}!</h1>
          <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" class="button">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, you can also click this link:</p>
          <p style="word-break: break-all;"><a href="${url}">${url}</a></p>
          <div class="note">
            <strong>Note:</strong> This verification link will expire in 24 hours.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} InternHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Hello ${name}!
    
    Thanks for signing up! Please verify your email address by clicking the link below:
    
    ${url}
    
    Note: This verification link will expire in 24 hours.
  `;
  
  return { subject, html, text };
}

/**
 * Get password reset email template
 */
function getPasswordResetEmailTemplate(name: string, url: string): EmailTemplate {
  const subject = `Reset your password`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #344A86, #407794); border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 40px 30px; border: 1px solid #E1DDD6; border-top: none; border-radius: 0 0 8px 8px; }
        h1 { color: #1e293b; font-size: 24px; margin-bottom: 20px; }
        p { color: #475569; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #344A86, #407794); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .footer { text-align: center; padding-top: 30px; color: #6E6B66; font-size: 14px; border-top: 1px solid #E1DDD6; }
        .warning { background: #F6ECD9; padding: 15px; border-radius: 6px; font-size: 14px; color: #4B4945; border-left: 4px solid #C2964B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${process.env.NEXTAUTH_URL}/logo-white.svg" alt="InternHub" style="width: 150px; height: auto;">
        </div>
        <div class="content">
          <h1>Hello ${name}!</h1>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" class="button">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also click this link:</p>
          <p style="word-break: break-all;"><a href="${url}">${url}</a></p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request this, please ignore this email.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} InternHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Hello ${name}!
    
    We received a request to reset your password. Click the link below to create a new password:
    
    ${url}
    
    Security Notice: This password reset link will expire in 1 hour. If you didn't request this, please ignore this email.
  `;
  
  return { subject, html, text };
}

/**
 * Get application received template
 */
function getApplicationReceivedTemplate(
  name: string,
  projectTitle: string,
  companyName: string
): EmailTemplate {
  const subject = `Application received: ${projectTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Application Received</h2>
      <p>Hi ${name},</p>
      <p>Your application for <strong>${projectTitle}</strong> at <strong>${companyName}</strong> has been received successfully.</p>
      <p>The company will review your application and get back to you soon.</p>
      <p>You can track your application status in your dashboard.</p>
      <p>Good luck!</p>
    </div>
  `;
  
  const text = `
    Application Received
    
    Hi ${name},
    
    Your application for ${projectTitle} at ${companyName} has been received successfully.
    
    The company will review your application and get back to you soon.
    
    You can track your application status in your dashboard.
    
    Good luck!
  `;
  
  return { subject, html, text };
}

/**
 * Get application status template
 */
function getApplicationStatusTemplate(
  name: string,
  projectTitle: string,
  status: string,
  message?: string
): EmailTemplate {
  const statusMessages = {
    shortlisted: 'Congratulations! You have been shortlisted.',
    accepted: 'Great news! Your application has been accepted.',
    rejected: 'Thank you for your interest. The company has decided to move forward with other candidates.',
  };
  
  const statusMessage = statusMessages[status as keyof typeof statusMessages] || `Your application status has been updated to: ${status}`;
  
  const subject = `Application update: ${projectTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Application Update</h2>
      <p>Hi ${name},</p>
      <p>${statusMessage}</p>
      ${message ? `<p>${message}</p>` : ''}
      <p>View details in your dashboard.</p>
    </div>
  `;
  
  const text = `
    Application Update
    
    Hi ${name},
    
    ${statusMessage}
    ${message ? `\n${message}\n` : ''}
    
    View details in your dashboard.
  `;
  
  return { subject, html, text };
}

/**
 * Get interview invitation template
 */
function getInterviewInvitationTemplate(
  name: string,
  companyName: string,
  date: string,
  time: string,
  type: string,
  link?: string
): EmailTemplate {
  const subject = `Interview invitation from ${companyName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Interview Invitation</h2>
      <p>Hi ${name},</p>
      <p>Congratulations! <strong>${companyName}</strong> has invited you for an interview.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Type:</strong> ${type}</p>
        ${link ? `<p><strong>Meeting Link:</strong> <a href="${link}">${link}</a></p>` : ''}
      </div>
      
      <p>Please confirm your availability or reschedule if needed.</p>
    </div>
  `;
  
  const text = `
    Interview Invitation
    
    Hi ${name},
    
    Congratulations! ${companyName} has invited you for an interview.
    
    Date: ${date}
    Time: ${time}
    Type: ${type}
    ${link ? `Meeting Link: ${link}` : ''}
    
    Please confirm your availability or reschedule if needed.
  `;
  
  return { subject, html, text };
}

/**
 * Get payment confirmation template
 */
function getPaymentConfirmationTemplate(
  name: string,
  amount: number,
  purpose: string,
  transactionId: string
): EmailTemplate {
  const subject = `Payment confirmation: ₹${amount}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Confirmation</h2>
      <p>Hi ${name},</p>
      <p>Your payment has been processed successfully.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
      </div>
      
      <p>Thank you for using InternHub!</p>
    </div>
  `;
  
  const text = `
    Payment Confirmation
    
    Hi ${name},
    
    Your payment has been processed successfully.
    
    Amount: ₹${amount}
    Purpose: ${purpose}
    Transaction ID: ${transactionId}
    
    Thank you for using InternHub!
  `;
  
  return { subject, html, text };
}

/**
 * Get withdrawal confirmation template
 */
function getWithdrawalConfirmationTemplate(
  name: string,
  amount: number,
  method: string,
  reference: string
): EmailTemplate {
  const subject = `Withdrawal confirmation: ₹${amount}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Withdrawal Confirmation</h2>
      <p>Hi ${name},</p>
      <p>Your withdrawal request has been processed successfully.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Method:</strong> ${method}</p>
        <p><strong>Reference:</strong> ${reference}</p>
      </div>
      
      <p>Funds should appear in your account within 2-3 business days.</p>
    </div>
  `;
  
  const text = `
    Withdrawal Confirmation
    
    Hi ${name},
    
    Your withdrawal request has been processed successfully.
    
    Amount: ₹${amount}
    Method: ${method}
    Reference: ${reference}
    
    Funds should appear in your account within 2-3 business days.
  `;
  
  return { subject, html, text };
}

/**
 * Get session booking template
 */
function getSessionBookingTemplate(
  studentName: string,
  mentorName: string,
  date: string,
  time: string,
  topic: string,
  meetingLink?: string
): EmailTemplate {
  const subject = `Mentor session booked with ${mentorName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Session Booked Successfully</h2>
      <p>Hi ${studentName},</p>
      <p>Your session with <strong>${mentorName}</strong> has been booked.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      </div>
      
      <p>The meeting link will be active 15 minutes before the session.</p>
    </div>
  `;
  
  const text = `
    Session Booked Successfully
    
    Hi ${studentName},
    
    Your session with ${mentorName} has been booked.
    
    Topic: ${topic}
    Date: ${date}
    Time: ${time}
    ${meetingLink ? `Meeting Link: ${meetingLink}` : ''}
    
    The meeting link will be active 15 minutes before the session.
  `;
  
  return { subject, html, text };
}

/**
 * Get session reminder template
 */
function getSessionReminderTemplate(
  name: string,
  mentorName: string,
  date: string,
  time: string,
  meetingLink?: string
): EmailTemplate {
  const subject = `Reminder: Mentor session with ${mentorName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Session Reminder</h2>
      <p>Hi ${name},</p>
      <p>This is a reminder for your upcoming session with <strong>${mentorName}</strong>.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ''}
      </div>
      
      <p>The session starts in 1 hour. Please be ready on time.</p>
    </div>
  `;
  
  const text = `
    Session Reminder
    
    Hi ${name},
    
    This is a reminder for your upcoming session with ${mentorName}.
    
    Date: ${date}
    Time: ${time}
    ${meetingLink ? `Meeting Link: ${meetingLink}` : ''}
    
    The session starts in 1 hour. Please be ready on time.
  `;
  
  return { subject, html, text };
}

/**
 * Get milestone completed template
 */
function getMilestoneCompletedTemplate(
  name: string,
  projectTitle: string,
  milestoneTitle: string,
  amount: number
): EmailTemplate {
  const subject = `Milestone completed: ${milestoneTitle}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Milestone Completed</h2>
      <p>Hi ${name},</p>
      <p>A milestone has been completed for project <strong>${projectTitle}</strong>.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Milestone:</strong> ${milestoneTitle}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
      </div>
      
      <p>Please review the work and approve the milestone.</p>
    </div>
  `;
  
  const text = `
    Milestone Completed
    
    Hi ${name},
    
    A milestone has been completed for project ${projectTitle}.
    
    Milestone: ${milestoneTitle}
    Amount: ₹${amount}
    
    Please review the work and approve the milestone.
  `;
  
  return { subject, html, text };
}

/**
 * Get new message template
 */
function getNewMessageTemplate(
  name: string,
  senderName: string,
  messagePreview: string,
  conversationUrl: string
): EmailTemplate {
  const subject = `New message from ${senderName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Message</h2>
      <p>Hi ${name},</p>
      <p>You have received a new message from <strong>${senderName}</strong>.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><em>"${messagePreview}"</em></p>
      </div>
      
      <p><a href="${conversationUrl}" style="background: #344A86; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Message</a></p>
    </div>
  `;
  
  const text = `
    New Message
    
    Hi ${name},
    
    You have received a new message from ${senderName}.
    
    "${messagePreview}"
    
    View the full message: ${conversationUrl}
  `;
  
  return { subject, html, text };
}

/**
 * Get review received template
 */
function getReviewReceivedTemplate(
  name: string,
  reviewerName: string,
  rating: number,
  comment?: string
): EmailTemplate {
  const subject = `New review received from ${reviewerName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Review</h2>
      <p>Hi ${name},</p>
      <p>You have received a new review from <strong>${reviewerName}</strong>.</p>
      
      <div style="background: #FAF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
        ${comment ? `<p><strong>Comment:</strong> "${comment}"</p>` : ''}
      </div>
      
      <p>View all your reviews in your dashboard.</p>
    </div>
  `;
  
  const text = `
    New Review
    
    Hi ${name},
    
    You have received a new review from ${reviewerName}.
    
    Rating: ${rating}/5
    ${comment ? `Comment: "${comment}"` : ''}
    
    View all your reviews in your dashboard.
  `;
  
  return { subject, html, text };
}

// Export all email functions
export const EmailSender = {
  send: sendEmail,
  welcome: sendWelcomeEmail,
  verification: sendVerificationEmail,
  passwordReset: sendPasswordResetEmail,
  applicationReceived: sendApplicationReceivedEmail,
  applicationStatus: sendApplicationStatusEmail,
  interviewInvitation: sendInterviewInvitationEmail,
  paymentConfirmation: sendPaymentConfirmationEmail,
  withdrawalConfirmation: sendWithdrawalConfirmationEmail,
  sessionBooking: sendSessionBookingEmail,
  sessionReminder: sendSessionReminderEmail,
  milestoneCompleted: sendMilestoneCompletedEmail,
  newMessage: sendNewMessageEmail,
  reviewReceived: sendReviewReceivedEmail,
};
