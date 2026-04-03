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

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"InternHub" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background: linear-gradient(135deg, #344A86, #407794);
              border-radius: 8px 8px 0 0;
            }
            .header img {
              width: 150px;
              height: auto;
            }
            .content {
              background: #ffffff;
              padding: 40px 30px;
              border: 1px solid #E1DDD6;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            h1 {
              color: #1e293b;
              font-size: 24px;
              margin-bottom: 20px;
              font-weight: 600;
            }
            p {
              color: #475569;
              margin-bottom: 20px;
              font-size: 16px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #344A86, #407794);
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .button:hover {
              opacity: 0.9;
            }
            .footer {
              text-align: center;
              padding-top: 30px;
              color: #64748b;
              font-size: 14px;
              border-top: 1px solid #E1DDD6;
            }
            .warning {
              background: #fff7ed;
              padding: 15px;
              border-radius: 6px;
              font-size: 14px;
              color: #4B4945;
              border-left: 4px solid #C2964B;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${process.env.NEXTAUTH_URL}/logo-white.svg" alt="InternHub">
            </div>
            <div class="content">
              <h1>Reset your password, ${name}!</h1>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can also click this link:</p>
              <p style="word-break: break-all; font-size: 14px;">
                <a href="${resetUrl}">${resetUrl}</a>
              </p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} InternHub. All rights reserved.</p>
                <p>
                  <small>
                    InternHub, Bengaluru, Karnataka, India<br>
                    <a href="${process.env.NEXTAUTH_URL}/privacy" style="color: #344A86;">Privacy Policy</a> |
                    <a href="${process.env.NEXTAUTH_URL}/terms" style="color: #344A86;">Terms of Service</a> |
                    <a href="${process.env.NEXTAUTH_URL}/contact" style="color: #344A86;">Contact Support</a>
                  </small>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}
