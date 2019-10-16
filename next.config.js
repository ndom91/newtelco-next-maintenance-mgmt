const { parsed: localEnv } = require('dotenv').config({ path: './.env' })
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
require('dotenv').config()
const path = require('path')
const Dotenv = require('dotenv-webpack')
const LogRocket = require('logrocket')
const setupLogRocketReact = require('logrocket-react')
const Sentry = require('@sentry/browser')

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

LogRocket.init('ui3vht/next-maintenance')
setupLogRocketReact(LogRocket)
// LogRocket.identify(this.props.session.user.id, {
//   name: this.props.session.user.name,
//   email: this.props.session.user.email
// })
Sentry.init({ dsn: 'https://627b5da84c4944f4acc2118b47dad88e@sentry.ndo.dev/3' })
LogRocket.getSessionURL(sessionURL => {
  Sentry.configureScope(scope => {
    scope.setExtra('sessionURL', sessionURL)
  })
})

const nextConfig = {
  target: 'server',
  compress: false,
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
