import { sendEmail } from '@/lib/utils/sendEmail';
import { Application } from '@/types/application';
import { User } from '@/types/user';
import { IUser } from '../db/models/user';

/**
 * Send application received email to applicant
 */
export async function sendApplicationReceivedEmail(
  applicant: User,
  _application: Application,
  jobTitle: string
) {
  const subject = `Application Received - ${jobTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #344A86; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #344A86; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Received</h1>
        </div>
        <div class="content">
          <p>Hi ${applicant.name},</p>
          
          <p>Thank you for your application to <strong>${jobTitle}</strong>.</p>
          
          <p>We have received your application and it is currently under review. You will be notified of any updates.</p>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/student/jobs/my-applications" class="button">
              View Application Status
            </a>
          </p>

          <p>Good luck!</p>
          
          <p>Best regards,<br>The SkillBridge Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: applicant.email, subject, html });
}

/**
 * Send new application notification to company
 */
export async function sendNewApplicationEmail(
  companyEmail: string,
  applicantName: string,
  jobTitle: string,
  applicationId: string
) {
  const subject = `New Application for ${jobTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #344A86; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #344A86; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Application Received</h1>
        </div>
        <div class="content">
          <p>You have received a new application for <strong>${jobTitle}</strong>.</p>
          
          <p><strong>Applicant:</strong> ${applicantName}</p>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/company/applications/${applicationId}" class="button">
              Review Application
            </a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: companyEmail, subject, html });
}

/**
 * Send application status update email
 */
export async function sendApplicationStatusEmail(
  applicant: IUser,
  jobTitle: string,
  status: string,
  message?: string
) {
  const statusMessages = {
    shortlisted: {
      title: 'Application Shortlisted',
      text: 'Congratulations! Your application has been shortlisted.',
    },
    interview: {
      title: 'Interview Scheduled',
      text: 'Your application has progressed to the interview stage.',
    },
    accepted: {
      title: 'Application Accepted',
      text: 'Congratulations! Your application has been accepted.',
    },
    rejected: {
      title: 'Application Update',
      text: 'Thank you for your interest. After careful consideration, we have decided to move forward with other candidates.',
    },
  };

  const statusInfo = statusMessages[status as keyof typeof statusMessages] || {
    title: 'Application Update',
    text: 'Your application status has been updated.',
  };

  const subject = `${statusInfo.title} - ${jobTitle}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${status === 'accepted' ? '#407794' : status === 'rejected' ? '#4B4945' : '#344A86'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #344A86; }
        .button { display: inline-block; background: #344A86; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${statusInfo.title}</h1>
        </div>
        <div class="content">
          <p>Hi ${applicant.name},</p>
          
          <p>${statusInfo.text}</p>
          
          <p><strong>Position:</strong> ${jobTitle}</p>

          ${message ? `
            <div class="message-box">
              <p><strong>Message from the employer:</strong></p>
              <p>${message}</p>
            </div>
          ` : ''}

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/student/jobs/my-applications" class="button">
              View Application
            </a>
          </p>

          <p>Best regards,<br>The SkillBridge Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: applicant.email, subject, html });
}

/**
 * Send interview invitation email
 */
export async function sendInterviewInvitationEmail(
  applicant: IUser,
  jobTitle: string,
  interviewDetails: {
    date: Date;
    time: string;
    location?: string;
    meetingLink?: string;
    instructions?: string;
  }
) {
  const subject = `Interview Invitation - ${jobTitle}`;
  
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
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .button { display: inline-block; background: #344A86; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Interview Invitation</h1>
        </div>
        <div class="content">
          <p>Hi ${applicant.name},</p>
          
          <p>Congratulations! You have been invited for an interview for the position of <strong>${jobTitle}</strong>.</p>
          
          <div class="details">
            <div class="detail-row">
              <strong>Date:</strong> ${interviewDetails.date.toLocaleDateString()}
            </div>
            <div class="detail-row">
              <strong>Time:</strong> ${interviewDetails.time}
            </div>
            ${interviewDetails.location ? `
              <div class="detail-row">
                <strong>Location:</strong> ${interviewDetails.location}
              </div>
            ` : ''}
            ${interviewDetails.meetingLink ? `
              <div class="detail-row">
                <strong>Meeting Link:</strong> <a href="${interviewDetails.meetingLink}">${interviewDetails.meetingLink}</a>
              </div>
            ` : ''}
          </div>

          ${interviewDetails.instructions ? `
            <div class="details">
              <strong>Instructions:</strong>
              <p>${interviewDetails.instructions}</p>
            </div>
          ` : ''}

          <p>Please confirm your attendance by clicking the button below.</p>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/student/jobs/my-applications" class="button">
              Confirm Attendance
            </a>
          </p>

          <p>Good luck!</p>
          
          <p>Best regards,<br>The SkillBridge Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: applicant.email, subject, html });
}

export default {
  sendApplicationReceivedEmail,
  sendNewApplicationEmail,
  sendApplicationStatusEmail,
  sendInterviewInvitationEmail,
};
