module.exports = {
  apps: [
    {
      name: 'qr-ordering',
      script: 'src/server.js',
      cwd: '/var/www/qr-ordering',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        HOST: '0.0.0.0',
      },
    },
  ],
};
