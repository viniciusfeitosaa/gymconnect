module.exports = {
  apps: [
    {
      name: 'gymconnect-production',
      script: 'start-production.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        JWT_SECRET: 'gymconnect-production-secret-2024'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Configurações de health check
      health_check_grace_period: 10000, // 10 segundos
      health_check_fatal_exceptions: true,
      // Configurações de restart
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Configurações de cluster
      exec_mode: 'cluster',
      // Configurações de monitoramento
      pmx: true,
      // Configurações de logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Configurações de segurança
      node_args: '--max-old-space-size=1024'
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:username/gymconnect.git',
      path: '/var/www/gymconnect',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
