/* eslint-disable no-console */
const http = require('http');
const https = require('https');

const baseUrl = process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const client = baseUrl.startsWith('https://') ? https : http;

const checks = [
  { name: 'Home', path: '/', expected: [200] },
  { name: 'Login', path: '/login', expected: [200] },
  { name: 'Signup', path: '/signup', expected: [200] },
  { name: 'Health', path: '/api/health', expected: [200, 503] },
  { name: 'Robots', path: '/robots.txt', expected: [200] },
  { name: 'Sitemap', path: '/sitemap.xml', expected: [200] },
];

function request(pathname) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathname, baseUrl);
    const req = client.request(
      {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        timeout: 8000,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode || 0);
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error(`Timeout for ${pathname}`));
    });
    req.end();
  });
}

async function run() {
  let failed = false;

  for (const check of checks) {
    try {
      const status = await request(check.path);
      const ok = check.expected.includes(status);
      console.log(`${ok ? 'PASS' : 'FAIL'} ${check.name}: ${check.path} -> ${status}`);
      if (!ok) {
        failed = true;
      }
    } catch (error) {
      failed = true;
      console.log(`FAIL ${check.name}: ${check.path} -> ${error.message}`);
    }
  }

  if (failed) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error('Smoke test failed:', error);
  process.exit(1);
});
