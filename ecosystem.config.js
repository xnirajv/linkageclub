module.exports = {
  apps: [
    {
      name: 'internhub',
      script: 'node',
      args: 'scripts/start.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
