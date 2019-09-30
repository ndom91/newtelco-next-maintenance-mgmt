const { parsed: localEnv } = require('dotenv').config({ path: './.env' })
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
require('dotenv').config()
const path = require('path')
const Dotenv = require('dotenv-webpack')

function HACK_removeMinimizeOptionFromCssLoaders (config) {
  console.warn(
    'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  )
  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach(u => {
        if (u.loader === 'css-loader' && u.options) {
          delete u.options.minimize
        }
      })
    }
  })
}

const nextConfig = {
  target: 'server',
  compress: false,
  publicRuntimeConfig: {
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
    HACK_removeMinimizeOptionFromCssLoaders(config)
    // Read the .env file
    new Dotenv({
      path: path.join(__dirname, '.env'),
      systemvars: true
    })
    return config
  }
}

module.exports = withCSS(nextConfig)
