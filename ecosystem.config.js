module.exports = {
  apps: [
    {
      name: 'saudi-visa-service',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/saudi-visa-service',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
