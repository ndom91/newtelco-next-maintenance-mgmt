const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const { withSentryConfig } = require('@sentry/nextjs')
const withLess = require('@zeit/next-less')
// Less Loader Workaround: https://github.com/vercel/next-plugins/issues/598#issuecomment-702907049
const SentryWebpackPluginOptions = {
  silent: true,
}

function HACK_removeMinimizeOptionFromCssLoaders(config) {
  // console.warn(
  //   'HACK: Removing `minimize` option from `css-loader` entries in Webpack config'
  // )
  config.module.rules.forEach((rule) => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach((u) => {
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
  webpack(config, options) {
    HACK_removeMinimizeOptionFromCssLoaders(config)
    config.stats = {
      warningsFilter: (warn) => warn.indexOf('Conflicting order between:') > -1,
    }
    config.plugins.push(
      new options.webpack.DefinePlugin({
        'process.env.NEXT_IS_SERVER': JSON.stringify(
          options.isServer.toString()
        ),
      })
    )
  },
}

module.exports = withSentryConfig(
  withBundleAnalyzer(withLess(nextConfig)),
  SentryWebpackPluginOptions
)
