import { sendEmail } from '@/lib/utils/sendEmail';

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string
) {
  const subject = 'Welcome to SkillBridge!';
  
  const roleMessages = {
    student: {
      title: 'Start Your Learning Journey',
      benefits: [
        'Access thousands of real-world projects',
        'Learn from industry mentors',
        'Build your portfolio',
        'Get hired by top companies',
      ],
      cta: 'Explore Projects',
      ctaLink: '/projects',
    },
    company: {
      title: 'Find Top Talent',
      benefits: [
        'Post unlimited job openings',
        'Access verified student profiles',
        'AI-powered candidate matching',
        'Streamlined hiring process',
      ],
      cta: 'Post Your First Job',
      ctaLink: '/dashboard/company/jobs/post',
    },
    mentor: {
      title: 'Share Your Expertise',
      benefits: [
        'Earn while teaching',
        'Build your personal brand',
        'Flexible scheduling',
        'Impact student careers',
      ],
      cta: 'Set Your Availability',
      ctaLink: '/dashboard/mentor/availability',
    },
    founder: {
      title: 'Build Your Dream Team',
      benefits: [
        'Find co-founders',
        'Hire early team members',
        'Access startup resources',
        'Connect with investors',
      ],
      cta: 'Create Startup Profile',
      ctaLink: '/dashboard/founder/startup',
    },
  };

  const roleInfo = roleMessages[role as keyof typeof roleMessages] || roleMessages.student;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #344A86 0%, #407794 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { background: #ffffff; padding: 40px 30px; }
        .welcome-message { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
        .benefits { background: #FAF9F7; padding: 30px; border-radius: 8px; margin: 30px 0; }
        .benefit-item { display: flex; align-items: start; margin-bottom: 15px; }
        .benefit-icon { color: #407794; font-size: 20px; margin-right: 12px; flex-shrink: 0; }
        .button { display: inline-block; background: #344A86; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .button:hover { background: #2D4074; }
        .divider { border-top: 1px solid #e5e7eb; margin: 30px 0; }
        .help-section { background: #F6ECD9; padding: 20px; border-radius: 8px; border-left: 4px solid #C2964B; margin: 20px 0; }
        .footer { text-align: center; color: #6E6B66; font-size: 14px; padding: 30px 20px; }
        .footer a { color: #344A86; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SkillBridge</div>
          <p style="font-size: 18px; margin: 0;">Connecting Talent with Opportunity</p>
        </div>
        
        <div class="content">
          <div class="welcome-message">Welcome, ${name}! 🎉</div>
          
          <p>Thank you for joining SkillBridge! We're excited to have you as part of our growing community.</p>
          
          <p style="font-size: 18px; font-weight: 600; color: #344A86; margin-top: 30px;">${roleInfo.title}</p>
          
          <div class="benefits">
            <p style="font-weight: 600; margin-bottom: 20px;">Here's what you can do:</p>
            ${roleInfo.benefits.map(benefit => `
              <div class="benefit-item">
                <span class="benefit-icon">✓</span>
                <span>${benefit}</span>
              </div>
            `).join('')}
          </div>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}${roleInfo.ctaLink}" class="button">
              ${roleInfo.cta}
            </a>
          </p>

          <div class="divider"></div>

          <div class="help-section">
            <p style="font-weight: 600; margin-bottom: 10px;">📚 Getting Started</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Complete your profile to get better matches</li>
              <li>Add your skills and experience</li>
              <li>Upload a professional photo</li>
              <li>Verify your email to unlock all features</li>
            </ul>
          </div>

          <p>If you have any questions, our support team is here to help. Just reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/help">Help Center</a>.</p>

          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>The SkillBridge Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}">Visit SkillBridge</a> • 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/help">Help Center</a> • 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact">Contact Us</a>
          </p>
          <p style="margin-top: 20px;">
            © ${new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
            You're receiving this email because you signed up for SkillBridge.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject, html });
}

/**
 * Send onboarding checklist email
 */
export async function sendOnboardingChecklistEmail(
  email: string,
  name: string,
  role: string
) {
  const subject = 'Complete Your SkillBridge Profile';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #344A86; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #FAF9F7; padding: 30px; border-radius: 0 0 8px 8px; }
        .checklist-item { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; display: flex; align-items: center; }
        .checkbox { width: 24px; height: 24px; border: 2px solid #d1d5db; border-radius: 4px; margin-right: 15px; flex-shrink: 0; }
        .button { display: inline-block; background: #344A86; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complete Your Profile</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          
          <p>Let's get your profile set up! Complete these steps to get the most out of SkillBridge:</p>

          <div class="checklist-item">
            <div class="checkbox"></div>
            <div>
              <strong>Upload a profile picture</strong>
              <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">Make a great first impression</p>
            </div>
          </div>

          <div class="checklist-item">
            <div class="checkbox"></div>
            <div>
              <strong>Add your skills</strong>
              <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">Help us match you with relevant opportunities</p>
            </div>
          </div>

          <div class="checklist-item">
            <div class="checkbox"></div>
            <div>
              <strong>Complete your bio</strong>
              <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">Tell others about yourself</p>
            </div>
          </div>

          <div class="checklist-item">
            <div class="checkbox"></div>
            <div>
              <strong>Verify your email</strong>
              <p style="margin: 5px 0 0; font-size: 14px; color: #6b7280;">Unlock all platform features</p>
            </div>
          </div>

          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/${role}/profile/edit" class="button">
              Complete Profile
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

  await sendEmail({ to: email, subject, html });
}

export default {
  sendWelcomeEmail,
  sendOnboardingChecklistEmail,
};
