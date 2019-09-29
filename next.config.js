const { parsed: localEnv } = require('dotenv').config()
const webpack = require('webpack')

const nextConfig = {
  target: 'server',
  compress: false,
  env: {
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD
  },
  exportPathMap: function () {
    return {
      '/': { page: '/' }
    }
  },
  webpack (config) {
    config.plugins.push(new webpack.EnvironmentPlugin(localEnv))

    return config
  }
}

module.exports = nextConfig
