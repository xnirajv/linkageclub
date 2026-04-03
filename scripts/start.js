const { spawn } = require('child_process');
const { validateEnv } = require('./validate-env');

const port = process.env.PORT || '3000';
const issues = validateEnv();

if (issues.length > 0) {
  console.error('Startup aborted due to invalid environment:\n');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['next', 'start', '-p', port],
  {
    stdio: 'inherit',
    shell: false,
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
