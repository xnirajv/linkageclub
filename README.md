# LinkageClub

LinkageClub is a Next.js 14 application with App Router, NextAuth, MongoDB, Prisma schema definitions, and a large API surface for jobs, projects, mentors, payments, community, and admin workflows.

## Production status

This repo is now structured for deployment with:

- a validated `.env.example`
- Docker and PM2 runtime configs
- an Nginx reverse-proxy example
- a health check endpoint at `/api/health`
- deployment scripts in `package.json`
- a deployment checklist in `DEPLOYMENT_CHECKLIST.md`

## Tech stack

- Next.js 14
- React 18
- TypeScript
- NextAuth
- MongoDB / Mongoose
- Prisma schema for data modeling
- Tailwind CSS
- Jest

## Local setup

1. Install dependencies:

```bash
npm ci
```

2. Copy envs:

```bash
cp .env.example .env
```

3. Fill in the required values:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`

4. Start development:

```bash
npm run dev
```

## Validation commands

```bash
npm run validate-env
npm run type-check
npm test -- --runInBand
npm run build
npm run deploy:check
npm run smoke-test
```

## Runtime notes

- Public health endpoint: `/api/health`
- Port is controlled by `PORT`
- Cross-origin API access is controlled by `ALLOWED_ORIGINS`
- Legacy `/auth/*` and old marketing routes are redirected to the current App Router paths
- A live launch checklist is available in [`LIVE_DEPLOYMENT_RUNBOOK.md`](C:/Users/Niraj%20Vankar/Downloads/files%20(11)/LinkageClub_fixed_codebase/LIVE_DEPLOYMENT_RUNBOOK.md)

## Deployment options

### Vercel

Best fit for this app.

1. Import the repo into Vercel.
2. Set the framework preset to `Next.js`.
3. Add environment variables from `.env.example`.
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the final production URL.
5. Deploy.
6. Verify `/api/health`.

### Netlify

Possible, but not the best fit because this app has heavy server functionality, auth, DB access, and many API routes.

1. Enable the Next.js runtime on Netlify.
2. Add all required environment variables.
3. Set build command to `npm run build`.
4. Set publish directory to `.next`.
5. Deploy and verify API route compatibility carefully.

### Heroku

Works if you want a simple Node deployment.

1. Create a Heroku app.
2. Add the env vars from `.env.example`.
3. Ensure the stack uses Node 20+.
4. Deploy the repo.
5. Heroku will use `Procfile` and `npm run start:prod`.
6. Verify `/api/health`.

### AWS

Recommended choices:

- App Runner for easiest container deployment
- ECS/Fargate for more control
- EC2 + PM2 + Nginx for traditional hosting

#### Docker on App Runner / ECS

1. Build the image:

```bash
npm run docker:build
```

2. Push it to ECR.
3. Set environment variables in the AWS service.
4. Expose port `3000`.
5. Route `/api/health` as the health check.

#### EC2 + PM2 + Nginx

1. Install Node 20+, Nginx, and PM2.
2. Copy the project to the server.
3. Run `npm ci && npm run build`.
4. Start with PM2:

```bash
pm2-runtime ecosystem.config.js
```

5. Use the included `nginx.conf` as a starting point.
6. Point Nginx to `127.0.0.1:3000`.

## Important feature envs

- Social login: `GOOGLE_*`, `GITHUB_*`, plus `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` / `NEXT_PUBLIC_GITHUB_AUTH_ENABLED`
- Email flows: `SMTP_*`
- Uploads: `CLOUDINARY_*`
- Payments: `RAZORPAY_*`
- Distributed rate limiting: `REDIS_URL`
- AI features: `OPENAI_API_KEY`

If a feature is not configured, leave its env vars empty and avoid exposing that feature in production until the integration is ready.
