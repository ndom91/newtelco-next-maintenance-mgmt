module.exports = {
  apps: [{
    name: 'next-maintenance',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: true,
    cwd: '/opt/newtelco/next-maintenance',
    max_memory_restart: '1G'
  }]
}
