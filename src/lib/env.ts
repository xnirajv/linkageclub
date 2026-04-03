import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required').optional(),
  MONGODB_DB: z.string().optional(),

  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NextAuth secret must be at least 32 characters')
    .default('development-secret-change-me-please-123'),
  NEXTAUTH_URL: z.string().url('NextAuth URL must be a valid URL').default('http://localhost:3000'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/, 'SMTP Port must be a number').optional(),
  SMTP_USER: z.string().email('SMTP User must be a valid email').optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email('SMTP From must be a valid email').optional(),
  SMTP_SECURE: z.enum(['true', 'false']).optional().default('false'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  REDIS_URL: z.string().url('Redis URL must be valid').optional(),

  NEXT_PUBLIC_APP_URL: z.string().url('App URL must be valid').default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_URL: z.string().url('Site URL must be valid').default('http://localhost:3000'),
  ALLOWED_ORIGINS: z.string().optional(),
  PORT: z.string().regex(/^\d+$/, 'PORT must be a number').optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors.map(
        (err) => `  - ${err.path.join('.')}: ${err.message}`
      );

      console.error('Invalid environment variables:\n');
      console.error(issues.join('\n'));
      console.error('\nCheck your .env file and deployment environment values.\n');
      throw new Error('Environment validation failed');
    }

    throw error;
  }
}

export const env = validateEnv();
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
