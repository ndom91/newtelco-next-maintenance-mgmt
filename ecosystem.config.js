module.exports = {
  apps: [{
    name: 'next-maintenance-prod',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: true,
    cwd: '/opt/newtelco/next-maintenance',
    max_memory_restart: '1G',
		env: {
      NODE_ENV: "development",
      MYSQL_HOST: "localhost",
      MYSQL_DATABASE: "maintenance_dev",
      MYSQL_USER: "maint_dev",
      MYSQL_PASSWORD: "N3wt3lco"
    },
    env_production: {
      NODE_ENV: "production",
      MYSQL_HOST: "localhost",
      MYSQL_DATABASE: "maintenance",
      MYSQL_USER: "maint",
      MYSQL_PASSWORD: "N3wt3lco"
    }
  }]
}
