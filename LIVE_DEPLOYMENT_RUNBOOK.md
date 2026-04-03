# Live Deployment Runbook

## Pre-Deploy

1. Copy values from [`.env.example`](C:/Users/Niraj%20Vankar/Downloads/files%20(11)/internhub_fixed_codebase/.env.example) into your platform secrets.
2. Set production URLs:
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SITE_URL`
3. Enable only the integrations you have fully configured:
   - `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` only if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
   - `NEXT_PUBLIC_GITHUB_AUTH_ENABLED=true` only if `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
4. Run:
   - `npm ci`
   - `npm run validate-env`
   - `npm run type-check`
   - `npm test -- --runInBand`
   - `npm run build`

## Deploy

1. Deploy the app/container/process.
2. Wait for the app to boot fully.
3. Verify health:
   - `GET /api/health`
4. Run smoke test:
   - `SMOKE_BASE_URL=https://your-domain.com node scripts/smoke-test.js`

## Post-Deploy Manual Checks

1. Open `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`.
2. Confirm auth redirect from `/dashboard` goes to `/login` when logged out.
3. Confirm OAuth buttons only show for enabled providers.
4. Confirm one file upload works.
5. Confirm contact form works if SMTP is configured.
6. Confirm payment create/verify only if Razorpay is configured.

## Monitoring

1. Uptime monitor:
   - URL: `/api/health`
   - Alert on `5xx` or timeout
2. Log monitor:
   - Watch auth failures, upload failures, payment verification failures, contact form failures
3. Backup:
   - Schedule `npm run backup`
   - Copy `backups/` to off-site storage

## Rollback Trigger

Rollback immediately if:

- `/api/health` is consistently `5xx`
- login or signup breaks for valid users
- uploads fail for all users
- payment verification starts failing
- major route returns `500` after deploy
