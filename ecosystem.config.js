module.exports = {
  apps: [{
    name: 'next-maintenance',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: true,
    cwd: '/opt/newtelco/next-maintenance',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      MYSQL_HOST: '94.249.131.5',
      MYSQL_DATABASE: 'maintenance_dev',
      MYSQL_USER: 'maint_dev',
      MYSQL_PASSWORD: 'N3wt3lco'
    },
    env_production: {
      NODE_ENV: 'production',
      MYSQL_HOST: '94.249.131.5',
      MYSQL_DATABASE: 'maintenance_dev',
      MYSQL_USER: 'maint_dev',
      MYSQL_PASSWORD: 'N3wt3lco'
    }
  }]

  // deploy : {
  // production : {
  // user : 'node',
  // host : '212.83.163.1',
  // ref  : 'origin/master',
  // repo : 'git@git.newtelco.dev:2424/ndomino/next-maintenance.git',
  // path : '/var/www/production',
  // 'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
  // }
  // }
}
