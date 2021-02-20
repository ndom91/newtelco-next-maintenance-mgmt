const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const webpack = require('webpack')
const withCSS = require('@zeit/next-css')
const withLess = require('@zeit/next-less')

const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const {
  NEXT_PUBLIC_SENTRY_DSN: SENTRY_DSN,
  SENTRY_ORG,
  SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN,
  NODE_ENV,
  VERCEL_GITHUB_COMMIT_SHA,
  VERCEL_GITLAB_COMMIT_SHA,
  VERCEL_BITBUCKET_COMMIT_SHA,
} = process.env

const COMMIT_SHA = VERCEL_GITHUB_COMMIT_SHA

process.env.SENTRY_DSN = SENTRY_DSN

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  // console.warn(
  //   'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  // )
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
  productionBrowserSourceMaps: true, // For Sentry
  experimental: {
    modern: true,
  },
  maximumFileSizeToCacheInBytes: 5242880,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: COMMIT_SHA,
  },
  webpack(config, options) {
    // config.plugins.push(new webpack.EnvironmentPlugin(localEnv))
    HACK_removeMinimizeOptionFromCssLoaders(config)
    config.stats = {
      warningsFilter: warn => warn.indexOf('Conflicting order between:') > -1,
    }
    if (!options.isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser'
    }
    config.plugins.push(
      new options.webpack.DefinePlugin({
        'process.env.NEXT_IS_SERVER': JSON.stringify(
          options.isServer.toString()
        ),
      })
    )
    if (
      SENTRY_DSN &&
      SENTRY_ORG &&
      SENTRY_PROJECT &&
      SENTRY_AUTH_TOKEN &&
      COMMIT_SHA &&
      NODE_ENV === 'production'
    ) {
      config.plugins.push(
        new SentryWebpackPlugin({
          include: '.next',
          ignore: ['node_modules'],
          stripPrefix: ['webpack://_N_E/'],
          urlPrefix: '~/_next',
          release: COMMIT_SHA,
          org: 'newtelco-gmbh',
          project: 'next-maintenance',
        })
      )
    }
    return config
  },
}

module.exports = withBundleAnalyzer(withLess(withCSS(nextConfig)))
