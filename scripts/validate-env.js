const { URL } = require('url');

function isPresent(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isSecureProductionUrl(value) {
  return value.startsWith('https://') || value.startsWith('http://localhost') || value.startsWith('http://127.0.0.1');
}

function validateEnv(env = process.env) {
  const issues = [];
  const nodeEnv = env.NODE_ENV || 'development';

  const requiredBase = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SITE_URL'];
  if (nodeEnv === 'production') {
    requiredBase.push('MONGODB_URI');
  }

  for (const key of requiredBase) {
    if (!isPresent(env[key])) {
      issues.push(`${key} is required${nodeEnv === 'production' ? ' in production' : ''}`);
    }
  }

  ['NEXTAUTH_URL', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SITE_URL'].forEach((key) => {
    if (isPresent(env[key]) && !isValidUrl(env[key])) {
      issues.push(`${key} must be a valid URL`);
    }
  });

  if (isPresent(env.NEXTAUTH_SECRET) && env.NEXTAUTH_SECRET.length < 32) {
    issues.push('NEXTAUTH_SECRET must be at least 32 characters');
  }

  const featureGroups = [
    {
      fields: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      message: 'Google OAuth requires both client ID and client secret',
    },
    {
      fields: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
      message: 'GitHub OAuth requires both client ID and client secret',
    },
    {
      fields: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'],
      message: 'Email delivery requires full SMTP configuration',
    },
    {
      fields: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
      message: 'File uploads require full Cloudinary configuration',
    },
    {
      fields: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'],
      message: 'Payments require full Razorpay configuration',
    },
  ];

  for (const group of featureGroups) {
    const provided = group.fields.filter((field) => isPresent(env[field]));
    if (provided.length > 0 && provided.length !== group.fields.length) {
      issues.push(group.message);
    }
  }

  ['CONTACT_EMAIL', 'SUPPORT_EMAIL'].forEach((key) => {
    if (isPresent(env[key]) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env[key])) {
      issues.push(`${key} must be a valid email address`);
    }
  });

  if (env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true' && (!isPresent(env.GOOGLE_CLIENT_ID) || !isPresent(env.GOOGLE_CLIENT_SECRET))) {
    issues.push('NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
  }

  if (env.NEXT_PUBLIC_GITHUB_AUTH_ENABLED === 'true' && (!isPresent(env.GITHUB_CLIENT_ID) || !isPresent(env.GITHUB_CLIENT_SECRET))) {
    issues.push('NEXT_PUBLIC_GITHUB_AUTH_ENABLED=true requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
  }

  if (nodeEnv === 'production') {
    ['NEXTAUTH_URL', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_SITE_URL'].forEach((key) => {
      if (isPresent(env[key]) && !isSecureProductionUrl(env[key])) {
        issues.push(`${key} must use HTTPS in production`);
      }
    });
  }

  return issues;
}

if (require.main === module) {
  const issues = validateEnv();

  if (issues.length > 0) {
    console.error('Environment validation failed:\n');
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exit(1);
  }

  console.log('Environment validation passed.');
}

module.exports = { validateEnv };
