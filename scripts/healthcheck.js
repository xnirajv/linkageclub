const http = require('http');
const https = require('https');

const port = process.env.PORT || 3000;
const healthcheckPath = process.env.HEALTHCHECK_PATH || '/api/health';
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

let requestOptions;
let client = http;

if (appUrl) {
  const url = new URL(healthcheckPath, appUrl);
  client = url.protocol === 'https:' ? https : http;
  requestOptions = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: `${url.pathname}${url.search}`,
    method: 'GET',
    timeout: 5000,
  };
} else {
  requestOptions = {
    host: '127.0.0.1',
    port,
    path: healthcheckPath,
    method: 'GET',
    timeout: 5000,
  };
}

const request = client.request(requestOptions, (response) => {
  if (response.statusCode && response.statusCode < 500) {
    process.exit(0);
    return;
  }

  process.exit(1);
});

request.on('error', () => process.exit(1));
request.on('timeout', () => {
  request.destroy();
  process.exit(1);
});
request.end();
