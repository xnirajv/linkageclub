import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"InternHub" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #344A86, #407794); border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #E1DDD6; border-top: none; border-radius: 0 0 8px 8px; }
            h1 { color: #1e293b; font-size: 24px; margin-bottom: 20px; font-weight: 600; }
            p { color: #475569; margin-bottom: 20px; font-size: 16px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #344A86, #407794); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 20px 0; }
            .footer { text-align: center; padding-top: 30px; color: #64748b; font-size: 14px; border-top: 1px solid #E1DDD6; }
            .note { background: #FAF9F7; padding: 15px; border-radius: 6px; font-size: 14px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${process.env.NEXTAUTH_URL}/logo-white.svg" alt="InternHub">
            </div>
            <div class="content">
              <h1>Welcome to InternHub, ${name}!</h1>
              <p>Thanks for signing up! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>If the button doesn't work, you can also click this link:</p>
              <p style="word-break: break-all; font-size: 14px;">
                <a href="${verificationUrl}">${verificationUrl}</a>
              </p>
              <div class="note">
                <strong>Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with InternHub, you can safely ignore this email.
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} InternHub. All rights reserved.</p>
                <p>
                  <small>
                    InternHub, Bengaluru, Karnataka, India<br>
                    <a href="${process.env.NEXTAUTH_URL}/privacy" style="color: #344A86;">Privacy Policy</a> |
                    <a href="${process.env.NEXTAUTH_URL}/terms" style="color: #344A86;">Terms of Service</a>
                  </small>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}